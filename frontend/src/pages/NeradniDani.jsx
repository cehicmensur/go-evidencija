import { useEffect, useState } from "react";

function NeradniDani() {
  const [dani, setDani] = useState([]);
  const [naziv, setNaziv] = useState("");
  const [datum, setDatum] = useState("");
  const [greska, setGreska] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = "https://go-evidencija-backend.onrender.com";

  const ucitaj = () => {
    fetch(`${API_URL}/neradni-dani`, {
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

        setDani(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setGreska("Greška kod učitavanja neradnih dana.");
      });
  };

  useEffect(() => {
    ucitaj();
  }, []);

  const dodaj = () => {
    if (!naziv || !datum) {
      alert("Popuni sva polja.");
      return;
    }

    fetch(`${API_URL}/neradni-dani`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        naziv,
        datum,
      }),
    }).then(() => {
      setNaziv("");
      setDatum("");
      ucitaj();
    });
  };

  const obrisi = (id) => {
    if (!confirm("Obrisati neradni dan?")) return;

    fetch(`${API_URL}/neradni-dani/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => ucitaj());
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Neradni dani
      </h1>

      {greska && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {greska}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <input
          className="border border-slate-300 rounded-xl px-4 py-3"
          placeholder="Naziv praznika"
          value={naziv}
          onChange={(e) => setNaziv(e.target.value)}
        />

        <input
          type="date"
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
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
              <th className="p-4 text-left">Naziv</th>
              <th className="p-4 text-left">Datum</th>
              <th className="p-4 text-left">Akcija</th>
            </tr>
          </thead>

          <tbody>
            {dani.map((d) => (
              <tr key={d.id} className="border-b">
                <td className="p-3">{d.naziv}</td>

                <td className="p-3">
                  {new Date(d.datum).toLocaleDateString("bs-BA")}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => obrisi(d.id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {dani.length === 0 && (
          <div className="p-6 text-slate-500">
            Nema evidentiranih neradnih dana.
          </div>
        )}
      </div>
    </div>
  );
}

export default NeradniDani;