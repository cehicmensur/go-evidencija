import { useState, useEffect } from "react";

import {
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
function DokumentiZaposlenika({
  zaposlenik,
}) {

const API_URL = import.meta.env.VITE_API_URL;

const token = localStorage.getItem("token");
  const [otvorenModal, setOtvorenModal] =
    useState(false);
    const [vrstaDokumenta, setVrstaDokumenta] =
  useState("Dekret");

const [nazivDokumenta, setNazivDokumenta] =
  useState("Dekret");
  const [datum, setDatum] = useState("");
const [opis, setOpis] = useState("");
const [datoteka, setDatoteka] = useState(null);
const [dokumenti, setDokumenti] = useState([]);
const sacuvajDokument = async () => {
  try {
    const formData = new FormData();

    formData.append(
      "zaposlenikId",
      zaposlenik.id
    );

    formData.append(
      "naziv",
      nazivDokumenta
    );

    formData.append(
      "vrsta",
      vrstaDokumenta
    );

    formData.append(
      "opis",
      opis
    );

    formData.append(
      "datum",
      datum
    );

    if (datoteka) {
      formData.append(
        "datoteka",
        datoteka
      );
    }

    const res = await fetch(
      `${API_URL}/dokumenti`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error();
    }
toast.success("Dokument je uspješno sačuvan.");

await ucitajDokumente();

setVrstaDokumenta("Dekret");
setNazivDokumenta("Dekret");
setDatum("");
setOpis("");
setDatoteka(null);

setOtvorenModal(false);

  } catch (error) {
    console.error(error);

toast.error("Greška kod spremanja dokumenta.");
  }
};
const ucitajDokumente = async () => {
  try {
    const res = await fetch(
      `${API_URL}/dokumenti/${zaposlenik.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setDokumenti(data);
  } catch (err) {
    console.error(err);
  }
};
const obrisiDokument = async (id) => {

  if (!window.confirm("Obrisati dokument?")) {
    return;
  }

  try {

    const res = await fetch(
      `${API_URL}/dokumenti/${id}`,
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

    await ucitajDokumente();

  } catch (error) {
    console.error(error);

    alert("Greška kod brisanja dokumenta.");
  }
};

useEffect(() => {
  if (zaposlenik?.id) {
    ucitajDokumente();
  }
}, [zaposlenik]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <div className="flex justify-between items-center border-b pb-4 mb-6">

        <h2 className="text-2xl font-bold">
          📂 Dokumenti zaposlenika
        </h2>

<button
  onClick={() => setOtvorenModal(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium"
>
<div className="flex items-center gap-2">
  <PlusIcon className="w-5 h-5" />
  <span>Dodaj dokument</span>
</div>
</button>

      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">

  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
    <div className="text-sm text-slate-500">
      Broj dokumenata
    </div>

    <div className="text-3xl font-bold text-blue-700 mt-2">
      {dokumenti.length}
    </div>
  </div>

  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
    <div className="text-sm text-slate-500">
      Posljednji dokument
    </div>

    <div className="text-lg font-semibold text-green-700 mt-2">
      {dokumenti.length > 0
        ? dokumenti[0].naziv
        : "-"}
    </div>
  </div>

</div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-left">
                Naziv dokumenta
              </th>

              <th className="p-4 text-left">
                Vrsta
              </th>

              <th className="p-4 text-center">
                Datum
              </th>

              <th className="p-4 text-center">
                Akcije
              </th>

            </tr>

          </thead>

<tbody>

  {dokumenti.length === 0 ? (

    <tr>
      <td
        colSpan="4"
        className="text-center py-16 text-slate-500"
      >
        Nema evidentiranih dokumenata.
      </td>
    </tr>

  ) : (

    dokumenti.map((dokument) => (

      <tr
        key={dokument.id}
        className="border-b hover:bg-slate-50"
      >

        <td className="p-4">
          {dokument.naziv}
        </td>

        <td className="p-4">
          {dokument.vrsta}
        </td>

        <td className="p-4 text-center">
          {new Date(dokument.datum).toLocaleDateString("bs-BA")}
        </td>

<td className="p-4 text-center">

<div className="flex justify-center gap-4">

  <a
    href={`${API_URL}/dokumenti/${dokument.id}/pregled`}
    target="_blank"
    rel="noreferrer"
    className="text-blue-600 hover:underline"
  >
 <EyeIcon className="w-5 h-5" />
  </a>

  <a
    href={`${API_URL}/dokumenti/${dokument.id}/download`}
    className="text-green-600 hover:underline"
  >
  <ArrowDownTrayIcon className="w-5 h-5" />
  </a>

  <button
    onClick={() => obrisiDokument(dokument.id)}
    className="text-red-600 hover:underline"
  >
<TrashIcon className="w-5 h-5" />
  </button>

</div>

</td>

      </tr>

    ))

  )}

</tbody>

        </table>

      </div>
{otvorenModal && (

  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8">

      <h2 className="text-2xl font-bold mb-6">
        📂 Dodaj dokument
      </h2>

      <div className="space-y-5">

        <div>

          <label className="block mb-2 font-medium">
            Vrsta dokumenta
          </label>

<select
  value={vrstaDokumenta}
  onChange={(e) => {
    setVrstaDokumenta(e.target.value);

    if (e.target.value !== "Ostalo") {
      setNazivDokumenta(e.target.value);
    } else {
      setNazivDokumenta("");
    }
  }}
  className="border rounded-xl w-full px-4 py-3"
>

  <option>Dekret</option>
  <option>Murasela</option>
  <option>Ugovor o radu</option>
  <option>Aneks ugovora</option>
  <option>Rješenje</option>
  <option>Diploma</option>
  <option>Certifikat</option>
  <option>Ostalo</option>

</select>

        </div>

<div>

  <label className="block mb-2 font-medium">
    Naziv dokumenta
  </label>

  <input
    value={nazivDokumenta}
    onChange={(e) =>
      setNazivDokumenta(e.target.value)
    }
    disabled={vrstaDokumenta !== "Ostalo"}
    className={`border rounded-xl w-full px-4 py-3 ${
      vrstaDokumenta !== "Ostalo"
        ? "bg-slate-100"
        : ""
    }`}
    placeholder="Naziv dokumenta"
  />

</div>

        <div>

          <label className="block mb-2 font-medium">
            Datum
          </label>

<input
  type="date"
  value={datum}
  onChange={(e) => setDatum(e.target.value)}
  className="border rounded-xl w-full px-4 py-3"
/>

        </div>
        <div>

  <label className="block mb-2 font-medium">
    Opis
  </label>

<textarea
  rows="3"
  value={opis}
  onChange={(e) => setOpis(e.target.value)}
  className="border rounded-xl w-full px-4 py-3"
  placeholder="Napomena ili kratak opis dokumenta..."
/>

</div>

<div>

  <label className="block mb-2 font-medium">
    Dokument
  </label>

<input
  type="file"
  onChange={(e) => setDatoteka(e.target.files[0])}
  className="border rounded-xl w-full px-4 py-3"
/>

</div>

      </div>

      <div className="flex justify-end gap-3 mt-8">

        <button
          onClick={() => setOtvorenModal(false)}
          className="px-5 py-3 rounded-xl border"
        >
          Odustani
        </button>

<button
  onClick={sacuvajDokument}
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
>
  Sačuvaj
</button>

      </div>

    </div>

  </div>

)}
    </div>
  );
}

export default DokumentiZaposlenika;