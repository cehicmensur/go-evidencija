import { useEffect, useState } from "react";

function Zaposlenici() {
  const [zaposlenici, setZaposlenici] = useState([]);

  const [ime, setIme] = useState("");
  const [pozicija, setPozicija] = useState("");
  const [godisnji, setGodisnji] = useState("");

  const API_URL = "https://go-evidencija-backend.onrender.com";

  const ucitajZaposlenike = async () => {
    try {
      const res = await fetch(`${API_URL}/zaposlenici`);
      const data = await res.json();

      setZaposlenici(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    ucitajZaposlenike();
  }, []);

  const dodajZaposlenika = async () => {
    try {
      const res = await fetch(`${API_URL}/zaposlenici`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ime,
          pozicija,
          godisnji: Number(godisnji),
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setIme("");
      setPozicija("");
      setGodisnji("");

      ucitajZaposlenike();
    } catch (error) {
      console.error(error);
    }
  };

  const obrisiZaposlenika = async (id) => {
    const potvrda = window.confirm(
      "Da li ste sigurni da želite obrisati zaposlenika?"
    );

    if (!potvrda) return;

    try {
      await fetch(`${API_URL}/zaposlenici/${id}`, {
        method: "DELETE",
      });

      ucitajZaposlenike();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Zaposlenici
        </h1>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Ime i prezime"
            className="border border-slate-300 rounded-xl px-4 py-3"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
          />

          <input
            type="text"
            placeholder="Pozicija"
            className="border border-slate-300 rounded-xl px-4 py-3"
            value={pozicija}
            onChange={(e) => setPozicija(e.target.value)}
          />

          <input
            type="number"
            placeholder="Broj dana godišnjeg"
            className="border border-slate-300 rounded-xl px-4 py-3"
            value={godisnji}
            onChange={(e) => setGodisnji(e.target.value)}
          />
        </div>

        <button
          onClick={dodajZaposlenika}
          className="mt-5 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Dodaj zaposlenika
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">
                ID
              </th>

              <th className="text-left p-4">
                Ime i prezime
              </th>

              <th className="text-left p-4">
                Pozicija
              </th>

              <th className="text-left p-4">
                Godišnji
              </th>

              <th className="text-left p-4">
                Akcije
              </th>
            </tr>
          </thead>

          <tbody>
            {zaposlenici.map((z) => (
              <tr
                key={z.id}
                className="border-t border-slate-200"
              >
                <td className="p-4">
                  {z.id}
                </td>

                <td className="p-4 font-medium">
                  {z.ime}
                </td>

                <td className="p-4">
                  {z.pozicija}
                </td>

                <td className="p-4">
                  {z.godisnji}
                </td>

                <td className="p-4">
                  <button
                    onClick={() =>
                      obrisiZaposlenika(z.id)
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
      </div>
    </div>
  );
}

export default Zaposlenici;