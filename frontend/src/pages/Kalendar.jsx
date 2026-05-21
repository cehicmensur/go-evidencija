import { useEffect, useState } from "react";

function Kalendar() {
  const [odsustva, setOdsustva] = useState([]);
  const [greska, setGreska] = useState("");

  const token = localStorage.getItem("token");

  const API_URL = "https://go-evidencija-backend.onrender.com";

  useEffect(() => {
    fetch(`${API_URL}/godisnji`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setGreska(data.error);
          return;
        }

        setOdsustva(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setGreska("Greška kod učitavanja kalendara.");
      });
  }, []);

  function formatDatum(datum) {
    const d = new Date(datum);

    const dan = String(d.getDate()).padStart(2, "0");
    const mjesec = String(d.getMonth() + 1).padStart(2, "0");
    const godina = d.getFullYear();

    return `${dan}.${mjesec}.${godina}.`;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        Kalendar odsustava
      </h1>

      <p className="text-slate-500 mb-8">
        Pregled svih evidentiranih odsustava
      </p>

      {greska && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {greska}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">
                Zaposlenik
              </th>

              <th className="p-4 text-left">
                Vrsta odsustva
              </th>

              <th className="p-4 text-left">
                Od
              </th>

              <th className="p-4 text-left">
                Do
              </th>

              <th className="p-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {odsustva.map((o) => (
              <tr
                key={o.id}
                className="border-b border-slate-200"
              >
                <td className="p-4">
                  {o.zaposlenik?.ime}
                </td>

                <td className="p-4">
                  {o.vrsta || "Godišnji odmor"}
                </td>

                <td className="p-4">
                  {formatDatum(o.od)}
                </td>

                <td className="p-4">
                  {formatDatum(o.do)}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      o.status === "odobreno"
                        ? "bg-emerald-100 text-emerald-700"
                        : o.status === "odbijeno"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {odsustva.length === 0 && !greska && (
          <div className="p-6 text-slate-500">
            Nema evidentiranih odsustava.
          </div>
        )}
      </div>
    </div>
  );
}

export default Kalendar;