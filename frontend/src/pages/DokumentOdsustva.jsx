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

  const potpisnik =
    tip === "rjesenje"
      ? {
          funkcija: "Predsjednik IO Medžlisa",
          ime: "Samir Bećirspahić, dipl. ing.",
        }
      : {
          funkcija: "Glavni imam",
          ime: "mr. Mensur ef. Ćehić",
        };

  return (
    <div className="min-h-screen bg-slate-200 p-6">
      <style>
        {`
          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            body * {
              visibility: hidden !important;
            }

            .print-document,
            .print-document * {
              visibility: visible !important;
            }

            .print-document {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="no-print max-w-[210mm] mx-auto mb-4 flex gap-3">
        <input
          className="border rounded-lg px-4 py-2"
          placeholder="Broj protokola"
          value={broj}
          onChange={(e) => setBroj(e.target.value)}
        />

        <input
          className="border rounded-lg px-4 py-2"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
        />

        <button
          onClick={() => window.print()}
          className="bg-slate-800 text-white px-5 py-2 rounded-lg"
        >
          Print / PDF
        </button>
      </div>

      <div className="print-document relative mx-auto bg-white shadow-xl overflow-hidden w-[210mm] h-[297mm]">
        <img
          src="/memorandum-miz-bihac.png"
          alt="Memorandum"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-10 px-[28mm] pt-[78mm] pb-[35mm] text-black font-serif">
          <div className="flex justify-between text-[15px] mb-[22mm]">
            <p>
              Broj: <strong>{broj || "____________"}</strong>
            </p>

            <p>
              Bihać, <strong>{datum}</strong>
            </p>
          </div>

          <h1 className="text-center text-[24px] font-bold mb-[18mm] tracking-wide">
            {naslov}
          </h1>

          <p className="text-[17px] leading-8 text-justify mb-[9mm]">
            Zaposleniku <strong>{podaci.zaposlenik?.ime}</strong>,
            odobrava se korištenje odsustva po osnovu{" "}
            <strong>{podaci.vrsta}</strong>.
          </p>

          <p className="text-[17px] leading-8 text-justify mb-[9mm]">
            Odsustvo se odobrava u periodu od{" "}
            <strong>{formatDatum(podaci.od)}</strong> do{" "}
            <strong>{formatDatum(podaci.do)}</strong>, u ukupnom trajanju od{" "}
            <strong>{ukupnoDana}</strong> dana.
          </p>

          {podaci.napomena && (
            <p className="text-[17px] leading-8 text-justify mb-[9mm]">
              Napomena: {podaci.napomena}
            </p>
          )}

          <p className="text-[17px] leading-8 text-justify mb-[18mm]">
            Ovo {tip === "rjesenje" ? "rješenje" : "odobrenje"} izdaje se na
            osnovu podnesenog zahtjeva i služi za potrebe evidencije odsustava
            zaposlenika Medžlisa Islamske zajednice Bihać.
          </p>

          <div className="flex justify-end mt-[10mm]">
            <div className="text-center text-[16px] w-[75mm]">
              <p className="font-bold mb-[16mm]">{potpisnik.funkcija}</p>
              <div className="border-t border-black mb-2"></div>
              <p className="font-bold">{potpisnik.ime}</p>
            </div>
          </div>

          <div className="absolute left-[28mm] bottom-[38mm] text-[14px] leading-6">
            <p>Dostavljeno:</p>
            <p>- imenovanom</p>
            <p>- personalni dosje</p>
            <p>- arhiva</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DokumentOdsustva;