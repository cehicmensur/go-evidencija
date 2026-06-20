import { useEffect, useState } from "react";

function RadniStaz() {
  const [zaposlenici, setZaposlenici] = useState([]);
  const [stavke, setStavke] = useState([]);

  const [zaposlenikId, setZaposlenikId] = useState("");
  const [poslodavac, setPoslodavac] = useState("");
  const [datumOd, setDatumOd] = useState("");
  const [datumDo, setDatumDo] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = "https://go-evidencija-backend.onrender.com";

  useEffect(() => {
    ucitajZaposlenike();
  }, []);

  useEffect(() => {
    if (zaposlenikId) {
      ucitajStaz();
    }
  }, [zaposlenikId]);

  const ucitajZaposlenike = async () => {
    try {
      const res = await fetch(`${API_URL}/zaposlenici`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setZaposlenici(data);
    } catch (error) {
      console.error(error);
    }
  };

  const ucitajStaz = async () => {
    try {
      const res = await fetch(
        `${API_URL}/radni-staz/${zaposlenikId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setStavke(data);
    } catch (error) {
      console.error(error);
    }
  };

  const dodaj = async () => {
    if (
      !zaposlenikId ||
      !poslodavac ||
      !datumOd ||
      !datumDo
    ) {
      alert("Popuni sva polja.");
      return;
    }

    try {
      await fetch(`${API_URL}/radni-staz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          zaposlenikId,
          poslodavac,
          datumOd,
          datumDo,
        }),
      });

      setPoslodavac("");
      setDatumOd("");
      setDatumDo("");

      ucitajStaz();
    } catch (error) {
      console.error(error);
    }
  };

  const obrisi = async (id) => {
    if (!confirm("Obrisati stavku radnog staža?")) {
      return;
    }

    try {
      await fetch(
        `${API_URL}/radni-staz/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      ucitajStaz();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Radni staž
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">

        <select
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={zaposlenikId}
          onChange={(e) =>
            setZaposlenikId(e.target.value)
          }
        >
          <option value="">
            Odaberi zaposlenika
          </option>

          {zaposlenici.map((z) => (
            <option key={z.id} value={z.id}>
              {z.ime}
            </option>
          ))}
        </select>

        <input
          className="border border-slate-300 rounded-xl px-4 py-3"
          placeholder="Poslodavac"
          value={poslodavac}
          onChange={(e) =>
            setPoslodavac(e.target.value)
          }
        />

        <input
          type="date"
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={datumOd}
          onChange={(e) =>
            setDatumOd(e.target.value)
          }
        />

        <input
          type="date"
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={datumDo}
          onChange={(e) =>
            setDatumDo(e.target.value)
          }
        />

        <button
          onClick={dodaj}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-4 py-3"
        >
          Dodaj
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">
                Poslodavac
              </th>
              <th className="p-4 text-left">
                Datum od
              </th>
              <th className="p-4 text-left">
                Datum do
              </th>
              <th className="p-4 text-left">
                Akcija
              </th>
            </tr>
          </thead>

          <tbody>
            {stavke.map((s) => (
              <tr
                key={s.id}
                className="border-b"
              >
                <td className="p-3">
                  {s.poslodavac}
                </td>

                <td className="p-3">
                  {new Date(
                    s.datumOd
                  ).toLocaleDateString("bs-BA")}
                </td>

                <td className="p-3">
                  {new Date(
                    s.datumDo
                  ).toLocaleDateString("bs-BA")}
                </td>

                <td className="p-3">
                  <button
                    onClick={() =>
                      obrisi(s.id)
                    }
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {stavke.length === 0 && (
          <div className="p-6 text-slate-500">
            Nema evidentiranog radnog staža.
          </div>
        )}
      </div>
    </div>
  );
}

export default RadniStaz;