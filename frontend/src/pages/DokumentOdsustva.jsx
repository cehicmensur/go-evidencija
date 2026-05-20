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

  const podaci = JSON.parse(
    localStorage.getItem("dokumentOdsustva")
  );

  const tip =
    localStorage.getItem("tipDokumenta") || "odobrenje";

  if (!podaci) {
    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">
          Nema podataka za dokument.
        </h1>
      </div>
    );
  }

  const ukupnoDana = brojDana(
    podaci.od,
    podaci.do
  );

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
    <div className="bg-slate-200 min-h-screen p-8">
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

      <div className="document bg-white max-w-[850px] min-h-[1120px] mx-auto relative shadow-xl overflow-hidden">
        {/* Memorandum pozadina */}
        <img
          src="/memorandum-miz-bihac.png"
          alt="Memorandum"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Sadržaj dokumenta */}
        <div className="relative z-10 px-20 pt-[240px] pb-[180px] text-[18px] leading-9 text-slate-900">
          <div className="flex justify-between mb-12 text-[16px]">
            <div>
              Broj: {broj || "________________"}
            </div>

            <div>
              Bihać, {datum}
            </div>
          </div>

          <h1 className="text-center text-[28px] font-bold mb-16">
            {naslov}
          </h1>

          <p className="mb-8 text-justify">
            Zaposleniku{" "}
            <strong>
              {podaci.zaposlenik?.ime}
            </strong>
            , odobrava se korištenje odsustva po osnovu{" "}
            <strong>{podaci.vrsta}</strong>.
          </p>

          <p className="mb-8 text-justify">
            Odsustvo se odobrava u periodu od{" "}
            <strong>
              {formatDatum(podaci.od)}
            </strong>{" "}
            do{" "}
            <strong>
              {formatDatum(podaci.do)}
            </strong>
            , u ukupnom trajanju od{" "}
            <strong>{ukupnoDana}</strong> dana.
          </p>

          {podaci.napomena && (
            <p className="mb-8 text-justify">
              Napomena: {podaci.napomena}
            </p>
          )}

          <p className="mb-12 text-justify">
            Ovo{" "}
            {tip === "rjesenje"
              ? "rješenje"
              : "odobrenje"}{" "}
            izdaje se na osnovu podnesenog zahtjeva
            i služi za potrebe evidencije odsustava
            zaposlenika Medžlisa Islamske zajednice
            Bihać.
          </p>

          <div className="flex justify-end mt-12">
            <div className="text-center">
              <p className="font-semibold">
                {potpisnik.funkcija}
              </p>

              <div className="h-10"></div>

              <p className="font-semibold">
                {potpisnik.ime}
              </p>
            </div>
          </div>

          <div className="mt-24 text-[15px]">
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