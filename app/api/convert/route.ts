import { NextResponse } from "next/server";
import Papa from "papaparse";
import path, { parse } from "path";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export async function POST(request: Request) {
  try {
    interface csvRow {
      name: string;
      category: string;
      image: string;
      description: string;
      link: string;
    }

    const formData = await request.formData();
    const file = formData.get("csv");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Brak pliku CSV" }, { status: 400 });
    }

    const csvText = await file.text();
    const parsedText = Papa.parse<csvRow>(csvText, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
    });

    const templatePath = path.resolve("./template/template_form.pdf");
    const template = fs.readFileSync(templatePath);

    const fontPath = path.resolve("./font/Roboto-Regular.ttf");
    const font = fs.readFileSync(fontPath);

    const readyPDF = await PDFDocument.create();

    for (const data of parsedText.data) {
      const tempDoc = await PDFDocument.load(template);
      tempDoc.registerFontkit(fontkit);
      const customFont = await tempDoc.embedFont(font);
      const form = tempDoc.getForm();

      const imageURL = data.image;
      const fetchImage = await fetch(imageURL);
      const image = await fetchImage.arrayBuffer();

      let embeddedImage;
      try {
        embeddedImage = await tempDoc.embedPng(image);
      } catch {
        embeddedImage = await tempDoc.embedJpg(image);
      }

      const { width, height } = embeddedImage.scale(0.45);

      const page = tempDoc.getPage(0);
      page.drawImage(embeddedImage, {
        x: 150,
        y: 300,
        width: width,
        height: height,
      });

      form.getTextField("name").setText(data.name);
      form.getTextField("category").setText(data.category);
      form.getTextField("description").setText(data.description);
      form.getTextField("link").setText(data.link);

      form.updateFieldAppearances(customFont);
      form.flatten();

      const [filledPage] = await readyPDF.copyPages(tempDoc, [0]);
      readyPDF.addPage(filledPage);
    }

    const pdf = await readyPDF.save();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=converted.pdf",
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Wystąpił błąd" }, { status: 500 });
  }
}
