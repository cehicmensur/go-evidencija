import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Zaposlenici() {
  const [zaposlenici, setZaposlenici] = useState([]);
  const [greska, setGreska] = useState("");

  const [ime, setIme] = useState("");
  const [pozicija, setPozicija] = useState("");
  const [datumPocetka, setDatumPocetka] = useState("");
  const [prethodniStazGodina, setPrethodniStazGodina] =
    useState(0);
  const [prethodniStazMjeseci, setPrethodniStazMjeseci] =
    useState(0);

  const [urediId, setUrediId] = useState(null);
  const [pretraga, setPretraga] = useState("");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  const ucitaj = async () => {
    try {
      const res = await fetch(`${API_URL}/zaposlenici`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.error) {
        setGreska(data.error);
        setZaposlenici([]);
        return;
      }

      setZaposlenici(data);
      setGreska("");
    } catch (err) {
      console.error(err);
      setGreska(
        "Greška kod učitavanja zaposlenika."
      );
    }
  };

  useEffect(() => {
    ucitaj();
  }, []);

  const dodajZaposlenika = async () => {
    if (!ime || !pozicija || !datumPocetka) {
      alert("Popuni sva polja.");
      return;
    }

    const metoda = urediId ? "PUT" : "POST";

    const url = urediId
      ? `${API_URL}/zaposlenici/${urediId}`
      : `${API_URL}/zaposlenici`;

    await fetch(url, {
      method: metoda,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ime,
        pozicija,
        datumPocetka,
        prethodniStazGodina,
        prethodniStazMjeseci,
      }),
    });

    setIme("");
    setPozicija("");
    setDatumPocetka("");
    setPrethodniStazGodina(0);
    setPrethodniStazMjeseci(0);
    setUrediId(null);

    ucitaj();
  };

  const uredi = (z) => {
    setUrediId(z.id);

    setIme(z.ime);
    setPozicija(z.pozicija);

    setDatumPocetka(
      z.datumPocetka
        ? z.datumPocetka.substring(0, 10)
        : ""
    );

    setPrethodniStazGodina(
      z.prethodniStazGodina || 0
    );

    setPrethodniStazMjeseci(
      z.prethodniStazMjeseci || 0
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const obrisi = async (id) => {
    if (
      !window.confirm(
        "Da li sigurno želiš obrisati zaposlenika?"
      )
    )
      return;

    await fetch(`${API_URL}/zaposlenici/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    ucitaj();
  };

  return (

        <div>
      <h1 className="text-4xl font-bold mb-8">
        Zaposlenici
      </h1>

      {greska && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {greska}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">

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
          onChange={(e) =>
            setDatumPocetka(e.target.value)
          }
        />

        <input
          type="number"
          className="border border-slate-300 rounded-xl px-4 py-3"
          placeholder="Staž (god)"
          value={prethodniStazGodina}
          onChange={(e) =>
            setPrethodniStazGodina(
              Number(e.target.value)
            )
          }
        />

        <input
          type="number"
          className="border border-slate-300 rounded-xl px-4 py-3"
          placeholder="Staž (mj)"
          value={prethodniStazMjeseci}
          onChange={(e) =>
            setPrethodniStazMjeseci(
              Number(e.target.value)
            )
          }
        />

        <button
          onClick={dodajZaposlenika}
          className={`rounded-xl px-4 py-3 text-white font-semibold ${
            urediId
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-slate-800 hover:bg-slate-700"
          }`}
        >
          {urediId
            ? "Sačuvaj izmjene"
            : "Dodaj zaposlenika"}
        </button>

      </div>

      <div className="mb-5">
        <input
          type="text"
          placeholder="🔍 Pretraži zaposlenika..."
          value={pretraga}
          onChange={(e) =>
            setPretraga(e.target.value)
          }
          className="border border-slate-300 rounded-xl px-4 py-3 w-full md:w-96"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">

<table className="min-w-full table-auto">

          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">
                R.br.
              </th>
              <th className="p-4 text-left">
                ID
              </th>
              <th className="p-4 text-left">
                Ime i prezime
              </th>
              <th className="p-4 text-left">
                Pozicija
              </th>
              <th className="p-4 text-left">
                Datum početka
              </th>
              <th className="p-4 text-left">
                Staž
              </th>
              <th className="p-4 text-left">
                Ukupno GO
              </th>
              <th className="p-4 text-left">
                Iskorišteno
              </th>
              <th className="p-4 text-left">
                Preostalo
              </th>
 <th className="p-4 text-center align-middle">
  Akcija
</th>
            </tr>
          </thead>

          <tbody>

            {zaposlenici
              .filter(
                (z) =>
                  z.ime
                    .toLowerCase()
                    .includes(
                      pretraga.toLowerCase()
                    ) ||
                  z.pozicija
                    .toLowerCase()
                    .includes(
                      pretraga.toLowerCase()
                    )
              )
              .map((z, index) => (
                <tr
                  key={z.id}
                  className="border-b"
                >

                  <td className="p-3">
                    {index + 1}
                  </td>

                  <td className="p-3 font-bold">
                    {z.id}
                  </td>

                  <td className="p-3">
                    {z.ime}
                  </td>

                  <td className="p-3">
                    {z.pozicija}
                  </td>

                  <td className="p-3">
                    {z.datumPocetka
                      ? new Date(
                          z.datumPocetka
                        ).toLocaleDateString(
                          "bs-BA"
                        )
                      : "-"}
                  </td>

<td className="p-3 whitespace-nowrap">
  {z.ukupnoGodina || 0} g.{" "}
  {z.ukupnoMjeseci || 0} mj.{" "}
  {z.ukupnoDana || 0} d.
</td>

<td className="p-3">
  {z.obracun?.ukupno ?? z.ukupnoGO ?? z.godisnji ?? 0}
</td>

                  <td className="p-3">
                    {z.iskoristeno ?? 0}
                  </td>

<td className="p-3">
  {z.preostalo ?? (z.obracun?.ukupno ?? z.ukupnoGO ?? 0)}
</td>

<td className="p-3 flex gap-2">
  <button
    onClick={() => uredi(z)}
    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg"
  >
    Uredi
  </button>

  <button
    onClick={() => navigate(`/zaposlenici/${z.id}`)}
    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
  >
    Karton
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