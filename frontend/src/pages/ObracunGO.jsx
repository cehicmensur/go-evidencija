import { useEffect, useState } from "react";

function ObracunGO() {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const [godina, setGodina] = useState(
    new Date().getFullYear()
  );

  const [obracuni, setObracuni] = useState([]);

  const ukupnoDana = obracuni.reduce(
  (suma, o) => suma + o.brojDanaGO,
  0
);

const prosjek =
  obracuni.length > 0
    ? (ukupnoDana / obracuni.length).toFixed(1)
    : 0;

  const ucitajObracune = async () => {
  try {
    const res = await fetch(
      `${API_URL}/obracun-go/${godina}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    setObracuni(data);
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  ucitajObracune();
}, [godina]);

    const obracunaj = async () => {
    console.log("Klik na Obračunaj");

    try {
      const res = await fetch(
        `${API_URL}/obracun-go/${godina}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

console.log("STATUS:", res.status);

const data = await res.json();

console.log("ODGOVOR:", data);

if (!res.ok) {
  alert(data.error || "Greška");
  return;
}

await ucitajObracune();
    } catch (err) {
      console.error(err);
      alert("Greška kod obračuna GO.");
    }
  };

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        Obračun GO
      </h1>

      <div className="flex gap-4 mb-8">

        <input
          type="number"
          value={godina}
          onChange={(e) =>
            setGodina(Number(e.target.value))
          }
          className="border rounded-lg px-4 py-2 w-40"
        />

        <button
          onClick={obracunaj}
          className="bg-slate-800 text-white px-6 rounded-lg"
        >
          Obračunaj
        </button>

      </div>
<div className="grid grid-cols-3 gap-4 mb-8">

  <div className="bg-white rounded-xl shadow p-5">
    <div className="text-slate-500 text-sm">
      Zaposlenika
    </div>

    <div className="text-3xl font-bold">
      {obracuni.length}
    </div>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
    <div className="text-slate-500 text-sm">
      Ukupno dana GO
    </div>

    <div className="text-3xl font-bold">
      {ukupnoDana}
    </div>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
    <div className="text-slate-500 text-sm">
      Prosjek
    </div>

    <div className="text-3xl font-bold">
      {prosjek}
    </div>
  </div>

</div>

      <table className="w-full bg-white rounded-xl shadow">

        <thead className="bg-slate-800 text-white">

          <tr>
            <th className="p-3 text-left">
              Zaposlenik
            </th>

            <th className="p-3 text-left">
              Broj dana GO
            </th>

<th className="p-3 text-left">
  Datum obračuna
</th>
          </tr>

        </thead>

        <tbody>

          {obracuni.map((o, index) => (

            <tr
              key={index}
              className="border-b"
            >

              <td className="p-3">
                {o.zaposlenik}
              </td>

              <td className="p-3">
                {o.brojDanaGO}
              </td>

<td className="p-3">
  {new Date(o.datumObracuna).toLocaleDateString("bs-BA")}
</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default ObracunGO;