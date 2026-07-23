import { useState } from "react";
import ModalRadniStaz from "./ModalRadniStaz";

function RadniOdnos({
  zaposlenik,
  osvjeziKarton,
}) {
const [otvorenModal, setOtvorenModal] =
  useState(false);

const [
  stavkaZaUredjivanje,
  setStavkaZaUredjivanje,
] = useState(null);

const token =
  localStorage.getItem("token");

const API_URL =
  import.meta.env.VITE_API_URL;

const obrisiStavku = async (id) => {
  if (
    !window.confirm(
      "Obrisati stavku radnog staža?"
    )
  ) {
    return;
  }

  try {
    const res = await fetch(
      `${API_URL}/radni-staz/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error();
    }

    osvjeziKarton();
  } catch {
    alert(
      "Greška prilikom brisanja."
    );
  }
};

  const kartice = [
    {
      naslov: "Staž u MIZ",
      boja: "bg-blue-600",
      tekst: "text-blue-100",
      godine: zaposlenik.godineUMIZ,
      mjeseci: zaposlenik.mjeseciUMIZ,
      dani: zaposlenik.daniUMIZ,
    },
    {
      naslov: "Prethodni radni staž",
      boja: "bg-orange-500",
      tekst: "text-orange-100",
      godine: zaposlenik.prethodniGodina,
      mjeseci: zaposlenik.prethodniMjeseci,
      dani: zaposlenik.prethodniDani,
    },
    {
      naslov: "Ukupan radni staž",
      boja: "bg-green-600",
      tekst: "text-green-100",
      godine: zaposlenik.ukupnoGodina,
      mjeseci: zaposlenik.ukupnoMjeseci,
      dani: zaposlenik.ukupnoDana,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-bold border-b pb-4 mb-6">
        💼 Radni odnos
      </h2>

      {/* KARTICE */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {kartice.map((k) => (

          <div
            key={k.naslov}
            className={`${k.boja} rounded-2xl shadow text-white p-6`}
          >

            <p className={`${k.tekst} text-sm uppercase tracking-wide`}>
              {k.naslov}
            </p>

            <p className="text-4xl font-bold mt-4">
              {k.godine ?? 0}
            </p>

            <p className="mt-1">
              godina
            </p>

            <div className="mt-4 flex justify-between text-sm">

              <div>
                <strong>{k.mjeseci ?? 0}</strong>
                <br />
                mjeseci
              </div>

              <div>
                <strong>{k.dani ?? 0}</strong>
                <br />
                dana
              </div>

            </div>

          </div>

        ))}

      </div>

      {/* DATUM ZAPOSLENJA */}

      <div className="bg-slate-50 border rounded-xl p-5 mb-8">

        <h3 className="text-lg font-semibold mb-3">
          Podaci o zaposlenju
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          <div>

            <p className="text-sm text-slate-500">
              Datum zaposlenja u MIZ
            </p>

            <p className="font-semibold text-lg">
              {zaposlenik.datumPocetka
                ? new Date(
                    zaposlenik.datumPocetka
                  ).toLocaleDateString("bs-BA")
                : "-"}
            </p>

          </div>

          <div>

            <p className="text-sm text-slate-500">
              Ukupan radni staž
            </p>

            <p className="font-semibold text-lg">
              {zaposlenik.ukupnoGodina} godina,
              {" "}
              {zaposlenik.ukupnoMjeseci} mjeseci,
              {" "}
              {zaposlenik.ukupnoDana} dana
            </p>

          </div>

        </div>

      </div>

      {/* PRETHODNI RADNI ODNOSI */}

      <div className="border rounded-xl overflow-hidden">

        <div className="bg-slate-100 px-5 py-4 border-b">

          <h3 className="text-lg font-semibold">
            Evidencija prethodnog radnog staža
          </h3>

        </div>

        {zaposlenik.radniStazovi?.length ? (

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="text-left p-4">
                  Poslodavac
                </th>

                <th className="text-left p-4">
                  Od
                </th>

<th className="text-left p-4">
  Do
</th>

<th className="text-center p-4">
  Trajanje
</th>

<th className="text-center p-4">
  Akcije
</th>

              </tr>

            </thead>

            <tbody>

              {zaposlenik.radniStazovi.map((s) => (

               <tr
  key={s.id}
  className="border-t hover:bg-slate-50"
>

  <td className="p-4">
    {s.poslodavac}
  </td>

  <td className="p-4">
    {new Date(
      s.datumOd
    ).toLocaleDateString("bs-BA")}
  </td>

  <td className="p-4">
    {new Date(
      s.datumDo
    ).toLocaleDateString("bs-BA")}
  </td>

  <td className="p-4 text-center font-semibold">
    {s.trajanje}
  </td>

  <td className="p-4">

    <div className="flex justify-center gap-2">

      <button
        onClick={() => {
          setStavkaZaUredjivanje(s);
          setOtvorenModal(true);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
      >
        ✏️
      </button>

      <button
        onClick={() =>
          obrisiStavku(s.id)
        }
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
      >
        🗑️
      </button>

    </div>

  </td>

</tr>

              ))}

            </tbody>

          </table>

        ) : (

          <div className="p-8 text-center text-slate-500">
            Nema evidentiranog prethodnog radnog staža.
          </div>

        )}

      </div>
<div className="mt-6 flex justify-end">

<button
  onClick={() => {
    setStavkaZaUredjivanje(null);
    setOtvorenModal(true);
  }}
  className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold"
>
  ➕ Dodaj prethodni radni staž
</button>

</div>

<ModalRadniStaz
  otvoren={otvorenModal}
  onClose={() => {
    setOtvorenModal(false);
    setStavkaZaUredjivanje(null);
  }}
  zaposlenikId={zaposlenik.id}
  token={token}
  API_URL={API_URL}
  onSacuvano={osvjeziKarton}
  stavka={stavkaZaUredjivanje}
/>
    </div>
  );
}

export default RadniOdnos;