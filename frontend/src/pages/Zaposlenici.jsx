import { useEffect, useState } from "react";

function Zaposlenici() {
  const [zaposlenici, setZaposlenici] = useState([]);
  const [greska, setGreska] = useState("");

  const [ime, setIme] = useState("");
  const [pozicija, setPozicija] = useState("");
  const [datumPocetka, setDatumPocetka] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = "https://go-evidencija-backend.onrender.com";

  const ucitaj = () => {
    fetch(`${API_URL}/zaposlenici`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setGreska(data.error);
          setZaposlenici([]);
          return;
        }

        setZaposlenici(data);
        setGreska("");
      })
      .catch(() => {
        setGreska("Greška kod učitavanja zaposlenika.");
      });
  };

  useEffect(() => {
    ucitaj();
  }, []);

  const dodajZaposlenika = () => {
    if (!ime || !pozicija || !datumPocetka) {
      alert("Popuni sva polja.");
      return;
    }

    fetch(`${API_URL}/zaposlenici`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ime,
        pozicija,
        datumPocetka,
      }),
    }).then(() => {
      setIme("");
      setPozicija("");
      setDatumPocetka("");
      ucitaj();
    });
  };

  const obrisi = (id) => {
    if (!confirm("Da li sigurno želiš obrisati zaposlenika?")) return;

    fetch(`${API_URL}/zaposlenici/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => ucitaj());
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Zaposlenici</h1>

      {greska && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {greska}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <input
          className="border border-slate-300 rounded-xl px-4 py-3"
          placeholder="Ime i prezime"
          value={ime}
          onChange={(e) => setIme(e.target.value)}
        />

        <input
          className="border border-slate-300 rounded-xl px-4 py-3"
          placeholder="Pozicija"
          value={pozicija}
          onChange={(e) => setPozicija(e.target.value)}
        />

        <input
          type="date"
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={datumPocetka}
          onChange={(e) => setDatumPocetka(e.target.value)}
        />

        <button
          onClick={dodajZaposlenika}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-4 py-3"
        >
          Dodaj
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Ime i prezime</th>
              <th className="p-4 text-left">Pozicija</th>
              <th className="p-4 text-left">Ukupno GO</th>
              <th className="p-4 text-left">Iskorišteno</th>
              <th className="p-4 text-left">Preostalo</th>
              <th className="p-4 text-left">Akcija</th>
            </tr>
          </thead>

          <tbody>
            {zaposlenici.map((z) => (
              <tr key={z.id} className="border-b">
                <td className="p-3 font-bold">{z.id}</td>
                <td className="p-3">{z.ime}</td>
                <td className="p-3">{z.pozicija}</td>
                <td className="p-3">{z.godisnji}</td>
                <td className="p-3">{z.iskoristeno ?? 0}</td>
                <td className="p-3">{z.preostalo ?? z.godisnji}</td>
                <td className="p-3">
                  <button
                    onClick={() => obrisi(z.id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {zaposlenici.length === 0 && !greska && (
          <div className="p-6 text-slate-500">
            Nema zaposlenika za prikaz.
          </div>
        )}
      </div>
    </div>
  );
}

export default Zaposlenici;