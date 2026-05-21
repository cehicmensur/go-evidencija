import { useEffect, useState } from "react";

function Zaposlenici() {
  const [zaposlenici, setZaposlenici] = useState([]);
  const [greska, setGreska] = useState("");

  const [ime, setIme] = useState("");
  const [pozicija, setPozicija] = useState("");
  const [datumPocetka, setDatumPocetka] = useState("");

  const token = localStorage.getItem("token");

  const ucitaj = () => {
    fetch("https://go-evidencija-backend.onrender.com/zaposlenici", {
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

        if (Array.isArray(data)) {
          setZaposlenici(data);
          setGreska("");
        } else {
          setGreska("Backend nije vratio listu zaposlenika.");
          setZaposlenici([]);
        }
      })
      .catch(() => {
        setGreska("Backend nije dostupan. Provjeri da li radi node server.js.");
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

    fetch("https://go-evidencija-backend.onrender.com/zaposlenici", {
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
    fetch(`https://go-evidencija-backend.onrender.com/zaposlenici/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => ucitaj());
  };

  const sacuvaj = (z) => {
    fetch(`https://go-evidencija-backend.onrender.com/zaposlenici/${z.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ime: z.ime,
        pozicija: z.pozicija,
        godisnji: Number(z.godisnji),
      }),
    }).then(() => ucitaj());
  };

  const updateField = (id, field, value) => {
    setZaposlenici((prev) =>
      prev.map((z) =>
        z.id === id ? { ...z, [field]: value } : z
      )
    );
  };

  const printIzvjestaj = () => {
    window.print();
  };

  return (
    <div>
      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .no-print {
              display: none !important;
            }

            .print-area {
              box-shadow: none !important;
              border-radius: 0 !important;
            }

            input {
              border: none !important;
              padding: 0 !important;
              background: transparent !important;
            }

            table {
              font-size: 12px;
            }

            th {
              color: black !important;
              background: #e5e7eb !important;
            }
          }
        `}
      </style>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">
          Zaposlenici
        </h1>

        <button
          onClick={printIzvjestaj}
          className="no-print bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl"
        >
          Print izvještaj
        </button>
      </div>

      {greska && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {greska}
        </div>
      )}

      <div className="no-print grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

      <div className="print-area overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Ime</th>
              <th className="p-4 text-left">Pozicija</th>
              <th className="p-4 text-left">Ukupno GO</th>
              <th className="p-4 text-left">Iskorišteno</th>
              <th className="p-4 text-left">Preostalo</th>
              <th className="no-print p-4 text-left">Akcija</th>
            </tr>
          </thead>

          <tbody>
            {zaposlenici.map((z) => (
              <tr key={z.id} className="border-b">
                <td className="p-3 font-bold text-slate-700">
                  {z.id}
                </td>

                <td className="p-3">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    value={z.ime}
                    onChange={(e) =>
                      updateField(z.id, "ime", e.target.value)
                    }
                  />
                </td>

                <td className="p-3">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    value={z.pozicija}
                    onChange={(e) =>
                      updateField(z.id, "pozicija", e.target.value)
                    }
                  />
                </td>

                <td className="p-3">
                  <input
                    type="number"
                    className="border rounded-lg px-3 py-2 w-24"
                    value={z.godisnji}
                    onChange={(e) =>
                      updateField(z.id, "godisnji", Number(e.target.value))
                    }
                  />
                </td>

                <td className="p-3 font-semibold text-orange-600">
                  {z.iskoristeno ?? 0}
                </td>

                <td className="p-3 font-semibold text-emerald-700">
                  {z.preostalo ?? z.godisnji}
                </td>

                <td className="no-print p-3 flex gap-2">
                  <button
                    onClick={() => sacuvaj(z)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg"
                  >
                    Sačuvaj
                  </button>

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
      </div>
    </div>
  );
}

export default Zaposlenici;