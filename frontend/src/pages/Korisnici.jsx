import { useEffect, useState } from "react";

function Korisnici() {
  const [korisnici, setKorisnici] = useState([]);
  const [greska, setGreska] = useState("");

  const token = localStorage.getItem("token");

  const ucitajKorisnike = () => {
    fetch("https://go-evidencija-backend.onrender.com/admin/korisnici", {
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
    fetch(`https://go-evidencija-backend.onrender.com/admin/korisnici/${id}`, {
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

  const odbijKorisnika = (id) => {
    fetch(`https://go-evidencija-backend.onrender.com/admin/korisnici/${id}`, {
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

    fetch(`https://go-evidencija-backend.onrender.com/admin/korisnici/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => ucitajKorisnike());
  };

  const promijeniUlogu = (id, uloga) => {
    fetch(`https://go-evidencija-backend.onrender.com/admin/korisnici/${id}`, {
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

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        Korisnici
      </h1>

      <p className="text-slate-500 mb-8">
        Pregled i odobravanje korisničkih naloga
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
              <th className="p-4 text-left">Ime</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Uloga</th>
              <th className="p-4 text-left">Zaposlenik</th>
              <th className="p-4 text-left">Status</th>
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

                <td className="p-3 flex gap-2">
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
                      onClick={() => odbijKorisnika(k.id)}
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