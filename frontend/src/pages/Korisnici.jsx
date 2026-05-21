import { useEffect, useState } from "react";

function Korisnici() {
  const [korisnici, setKorisnici] = useState([]);
  const [greska, setGreska] = useState("");
  const [lozinke, setLozinke] = useState({});

  const token = localStorage.getItem("token");
  const API_URL = "https://go-evidencija-backend.onrender.com";

  const ucitajKorisnike = () => {
    fetch(`${API_URL}/admin/korisnici`, {
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

        setKorisnici(data);
        setGreska("");
      });
  };

  useEffect(() => {
    ucitajKorisnike();
  }, []);

  const odobriKorisnika = (id) => {
    fetch(`${API_URL}/admin/korisnici/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        odobren: true,
      }),
    }).then(() => ucitajKorisnike());
  };

  const vratiNaCekanje = (id) => {
    fetch(`${API_URL}/admin/korisnici/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        odobren: false,
      }),
    }).then(() => ucitajKorisnike());
  };

  const obrisiKorisnika = (id) => {
    if (!confirm("Da li sigurno želiš obrisati korisnika?")) return;

    fetch(`${API_URL}/admin/korisnici/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => ucitajKorisnike());
  };

  const promijeniUlogu = (id, uloga) => {
    fetch(`${API_URL}/admin/korisnici/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uloga,
      }),
    }).then(() => ucitajKorisnike());
  };

  const resetLozinke = (id) => {
    const novaLozinka = lozinke[id];

    if (!novaLozinka || novaLozinka.length < 6) {
      alert("Nova lozinka mora imati najmanje 6 karaktera.");
      return;
    }

    fetch(`${API_URL}/admin/reset-lozinka/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        novaLozinka,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        alert(data.message || "Lozinka je resetovana.");

        setLozinke((prev) => ({
          ...prev,
          [id]: "",
        }));
      });
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        Korisnici
      </h1>

      <p className="text-slate-500 mb-8">
        Pregled, odobravanje i administracija korisničkih naloga
      </p>

      {greska && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {greska}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Ime i prezime</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Uloga</th>
              <th className="p-4 text-left">Zaposlenik</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Nova lozinka</th>
              <th className="p-4 text-left">Akcija</th>
            </tr>
          </thead>

          <tbody>
            {korisnici.map((k) => (
              <tr key={k.id} className="border-b">
                <td className="p-3 font-bold">
                  {k.id}
                </td>

                <td className="p-3">
                  {k.ime}
                </td>

                <td className="p-3">
                  {k.email}
                </td>

                <td className="p-3">
                  <select
                    className="border rounded-lg px-3 py-2"
                    value={k.uloga}
                    onChange={(e) =>
                      promijeniUlogu(k.id, e.target.value)
                    }
                  >
                    <option value="zaposlenik">
                      zaposlenik
                    </option>

                    <option value="admin">
                      admin
                    </option>
                  </select>
                </td>

                <td className="p-3">
                  {k.zaposlenik?.ime || "-"}
                </td>

                <td className="p-3 font-semibold">
                  {k.odobren ? (
                    <span className="text-emerald-700">
                      Odobren
                    </span>
                  ) : (
                    <span className="text-yellow-600">
                      Na čekanju
                    </span>
                  )}
                </td>

                <td className="p-3">
                  <input
                    type="password"
                    className="border rounded-lg px-3 py-2 w-40"
                    placeholder="Nova lozinka"
                    value={lozinke[k.id] || ""}
                    onChange={(e) =>
                      setLozinke((prev) => ({
                        ...prev,
                        [k.id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    onClick={() => resetLozinke(k.id)}
                    className="mt-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg"
                  >
                    Reset
                  </button>
                </td>

                <td className="p-3 flex flex-wrap gap-2">
                  {!k.odobren && (
                    <button
                      onClick={() => odobriKorisnika(k.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg"
                    >
                      Odobri
                    </button>
                  )}

                  {k.odobren && (
                    <button
                      onClick={() => vratiNaCekanje(k.id)}
                      className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg"
                    >
                      Vrati na čekanje
                    </button>
                  )}

                  <button
                    onClick={() => obrisiKorisnika(k.id)}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {korisnici.length === 0 && (
          <div className="p-6 text-slate-500">
            Nema korisnika za prikaz.
          </div>
        )}
      </div>
    </div>
  );
}

export default Korisnici;