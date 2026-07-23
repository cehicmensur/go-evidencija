import { useEffect, useState } from "react";

function HistorijaObracuna({ zaposlenikId }) {
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const [obracuni, setObracuni] = useState([]);

  useEffect(() => {
    ucitaj();
  }, [zaposlenikId]);

  const ucitaj = async () => {
    try {
      const res = await fetch(
        `${API_URL}/zaposlenici/${zaposlenikId}/obracuni`,
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

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      <h2 className="text-xl font-semibold border-b pb-3 mb-6">
        📜 Historija obračuna godišnjeg odmora
      </h2>

      {obracuni.length === 0 ? (
        <div className="text-gray-500">
          Za ovog zaposlenika još nije izvršen obračun.
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-3 text-left">
                Godina
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
            {obracuni.map((o) => (
              <tr
                key={o.id}
                className="border-b"
              >
                <td className="p-3">
                  {o.godina}
                </td>

                <td className="p-3 font-semibold">
                  {o.brojDanaGO}
                </td>

                <td className="p-3">
                  {new Date(
                    o.datumObracuna
                  ).toLocaleDateString("bs-BA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HistorijaObracuna;