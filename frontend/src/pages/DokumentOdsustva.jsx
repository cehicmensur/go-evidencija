import { useState } from "react";

function formatDatum(datum) {
  const d = new Date(datum);
  const dan = String(d.getDate()).padStart(2, "0");
  const mjesec = String(d.getMonth() + 1).padStart(2, "0");
  const godina = d.getFullYear();

  return `${dan}.${mjesec}.${godina}.`;
}

function brojDana(od, doDatuma) {
  const start = new Date(od);
  const end = new Date(doDatuma);

  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function DokumentOdsustva() {
  const [broj, setBroj] = useState("");
  const [datum, setDatum] = useState(formatDatum(new Date()));

  const podaci = JSON.parse(localStorage.getItem("dokumentOdsustva"));
  const tip = localStorage.getItem("tipDokumenta") || "odobrenje";

  if (!podaci) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Nema podataka za dokument.</h1>
      </div>
    );
  }

  const ukupnoDana = brojDana(podaci.od, podaci.do);

  const naslov =
    tip === "rjesenje"
      ? "RJEŠENJE O ODOBRENJU ODSUSTVA"
      : "ODOBRENJE ODSUSTVA";

  const potpis =
    tip === "rjesenje"
      ? "Predsjednik Medžlisa"
      : "Glavni imam";

  return (
    <div className="bg-slate-100 min-h-screen p-8">
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }

            body {
              background: white !important;
            }

            .document {
              box-shadow: none !important;
              margin: 0 !important;
              width: 100% !important;
            }
          }
        `}
      </style>

      <div className="no-print mb-6 flex gap-4">
        <input
          className="border rounded-lg px-4 py-2"
          placeholder="Broj protokola"
          value={broj}
          onChange={(e) => setBroj(e.target.value)}
        />

        <input
          className="border rounded-lg px-4 py-2"
          placeholder="Datum"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
        />

        <button
          onClick={() => window.print()}
          className="bg-slate-800 text-white px-5 py-2 rounded-lg"
        >
          Print / Sačuvaj kao PDF
        </button>
      </div>

      <div className="document bg-white max-w-4xl mx-auto p-14 shadow rounded-xl text-slate-900">
        <div className="text-center border-b pb-6 mb-8">
          <h1 className="text-2xl font-bold">
            MEDŽLIS ISLAMSKE ZAJEDNICE BIHAĆ
          </h1>
          <p className="text-sm mt-2">
            Evidencija odsustava zaposlenika
          </p>
        </div>

        <div className="mb-8 text-sm">
          <p>Broj: {broj || "___________"}</p>
          <p>Bihać, {datum}</p>
        </div>

        <h2 className="text-center text-xl font-bold mb-10">
          {naslov}
        </h2>

        <p className="mb-6 leading-8 text-justify">
          Zaposleniku <strong>{podaci.zaposlenik?.ime}</strong>,
          na radnom mjestu <strong>{podaci.zaposlenik?.pozicija || "____________"}</strong>,
          odobrava se korištenje odsustva po osnovu:
          <strong> {podaci.vrsta}</strong>.
        </p>

        <p className="mb-6 leading-8 text-justify">
          Odsustvo se odobrava u periodu od{" "}
          <strong>{formatDatum(podaci.od)}</strong> do{" "}
          <strong>{formatDatum(podaci.do)}</strong>, u ukupnom trajanju od{" "}
          <strong>{ukupnoDana}</strong> dana.
        </p>

        {podaci.napomena && (
          <p className="mb-6 leading-8 text-justify">
            Napomena: {podaci.napomena}
          </p>
        )}

        <p className="mb-12 leading-8 text-justify">
          Ovo {tip === "rjesenje" ? "rješenje" : "odobrenje"} izdaje se na osnovu
          evidentiranog zahtjeva u sistemu GO Evidencija i služi u svrhu interne
          evidencije odsustava zaposlenika.
        </p>

        <div className="flex justify-end mt-20">
          <div className="text-center">
            <p className="mb-16">{potpis}</p>
            <p>________________________</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DokumentOdsustva;