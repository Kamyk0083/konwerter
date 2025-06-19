"use client";

import Image from "next/image";

export default function Home() {
  const convertData = async () => {
    const CSVfile = document.getElementById("CSVfile") as HTMLInputElement;

    if (!CSVfile.files || CSVfile.files.length === 0) {
      alert("Nie wybrano pliku CSV");
      return;
    }

    const CSVData = new FormData();
    CSVData.append("csv", CSVfile.files[0]);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: CSVData,
      });

      if (!response.ok) {
        alert("Błąd podczas generowania PDF");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const downloadHyperLink = document.createElement("a");
      downloadHyperLink.href = url;
      downloadHyperLink.download = "converted.pdf";
      document.body.appendChild(downloadHyperLink);
      downloadHyperLink.click();
      downloadHyperLink.remove();
    } catch (error) {
      alert("Wystąpił błąd");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 flex flex-col gap-6 border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-center text-foreground mb-2">
          Wygeneruj plik PDF na podstawie danych z pliku CSV
        </h1>
        <div className="flex flex-col gap-4">
          <label
            htmlFor="file"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-200"
          >
            Prześlij plik CSV z takimi danymi:
            <ul className="list-disc list-inside text-xs mt-1 text-zinc-500 dark:text-zinc-400">
              <li>zdjęcie</li>
              <li>nazwa</li>
              <li>kategoria</li>
              <li>opis</li>
              <li>link do strony</li>
            </ul>
          </label>
          <input
            type="file"
            accept=".csv"
            name="file"
            id="CSVfile"
            className="block w-full text-sm text-zinc-700 dark:text-zinc-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-200 dark:hover:file:bg-zinc-700"
          />
          <button
            type="button"
            onClick={convertData}
            className="mt-2 w-full py-2 px-4 bg-zinc-900 text-white rounded-lg font-semibold shadow hover:bg-zinc-700 transition-colors dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Prześlij dane
          </button>
        </div>
      </div>
      <footer className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <a
          href="https://mail.google.com/mail/?view=cm&to=u81_ksakam_waw@technischools.com"
          target="_blank"
          className="underline hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          Kontakt
        </a>
      </footer>
    </div>
  );
}
