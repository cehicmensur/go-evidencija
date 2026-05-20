import { useEffect, useMemo, useState } from "react";

const vrsteOdsustva = [
  "Godišnji odmor",
  "Slobodni dan",
  "Ženidba/udaja",
  "Smrt užeg člana porodice",
  "Rođenje djeteta",
  "Bolovanje",
  "Službeni put",
  "Doškolovanje / stručno usavršavanje",
  "Ostalo",
];

function formatDatum(datum) {
  const d = new Date(datum);
  const dan = String(d.getDate()).padStart(2, "0");
  const mjesec = String(d.getMonth() + 1).padStart(2, "0");
  const godina = d.getFullYear();

  return `${dan}.${mjesec}.${godina}.`;
}

function datumZaBackend(datum) {
  const [dan, mjesec, godina] = datum.split(".");
  return `${godina}-${mjesec}-${dan}`;
}

function Godisnji() {
  const [zahtjevi, setZahtjevi] = useState([]);
  const [zaposlenici, setZaposlenici] = useState([]);
  const [greska, setGreska] = useState("");

  const [zaposlenikId, setZaposlenikId] = useState("");
  const [vrsta, setVrsta] = useState("Godišnji odmor");
  const [od, setOd] = useState("");
  const [doDatuma, setDoDatuma] = useState("");
  const [napomena, setNapomena] = useState("");

  const [filterStatus, setFilterStatus] = useState("");
  const [filterVrsta, setFilterVrsta] = useState("");
  const [pretraga, setPretraga] = useState("");

  const token = localStorage.getItem("token");
  const korisnik = JSON.parse(localStorage.getItem("korisnik"));

  const API_URL = "https://go-evidencija-backend.onrender.com";

  const ucitajZahtjeve = () => {
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

        setZahtjevi(data);
        setGreska("");
      });
  };

  const ucitajZaposlenike = () => {
    if (korisnik?.uloga !== "admin") return;

    fetch(`${API_URL}/zaposlenici`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setZaposlenici(data);
        }
      });
  };

  useEffect(() => {
    ucitajZahtjeve();
    ucitajZaposlenike();
  }, []);

  const dodajZahtjev = () => {
    if (!od || !doDatuma) {
      alert("Unesi datume odsustva.");
      return;
    }

    if (korisnik?.uloga === "admin" && !zaposlenikId) {
      alert("Odaberi zaposlenika.");
      return;
    }

    fetch(`${API_URL}/godisnji`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        zaposlenikId,
        vrsta,
        od: datumZaBackend(od),
        do: datumZaBackend(doDatuma),
        napomena,
      }),
    }).then(() => {
      setZaposlenikId("");
      setVrsta("Godišnji odmor");
      setOd("");
      setDoDatuma("");
      setNapomena("");

      ucitajZahtjeve();
    });
  };

  const promijeniStatus = (id, status) => {
    fetch(`${API_URL}/godisnji/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }).then(() => ucitajZahtjeve());
  };

  const obrisiOdsustvo = (id) => {
    if (!confirm("Da li sigurno želiš obrisati ovo odsustvo?")) return;

    fetch(`${API_URL}/godisnji/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(() => ucitajZahtjeve());
  };

  const otvoriDokument = (odsustvo, tip) => {
    localStorage.setItem(
      "dokumentOdsustva",
      JSON.stringify(odsustvo)
    );

    localStorage.setItem("tipDokumenta", tip);

    window.open("/dokument-odsustva", "_blank");
  };

  const filtriraniZahtjevi = useMemo(() => {
    return zahtjevi.filter((z) => {
      const matchStatus =
        !filterStatus || z.status === filterStatus;

      const matchVrsta =
        !filterVrsta || z.vrsta === filterVrsta;

      const ime = z.zaposlenik?.ime || "";

      const matchPretraga =
        ime.toLowerCase().includes(pretraga.toLowerCase());

      return matchStatus && matchVrsta && matchPretraga;
    });
  }, [zahtjevi, filterStatus, filterVrsta, pretraga]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            Odsustva
          </h1>

          <p className="text-slate-500 mt-2">
            Evidencija godišnjih odmora i drugih odsustava
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl"
        >
          Print izvještaj
        </button>
      </div>

      {greska && (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
          {greska}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {korisnik?.uloga === "admin" && (
          <select
            className="border border-slate-300 rounded-xl px-4 py-3"
            value={zaposlenikId}
            onChange={(e) => setZaposlenikId(e.target.value)}
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
        )}

        {korisnik?.uloga !== "admin" && (
          <div className="border border-slate-300 rounded-xl px-4 py-3 bg-slate-100 text-slate-600">
            Zahtjev šaljete za svoj profil
          </div>
        )}

        <select
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={vrsta}
          onChange={(e) => setVrsta(e.target.value)}
        >
          {vrsteOdsustva.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="dd.mm.gggg"
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={od}
          onChange={(e) => setOd(e.target.value)}
        />

        <input
          type="text"
          placeholder="dd.mm.gggg"
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={doDatuma}
          onChange={(e) => setDoDatuma(e.target.value)}
        />

        <button
          onClick={dodajZahtjev}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-4 py-3"
        >
          Pošalji zahtjev
        </button>
      </div>

      <div className="mb-8">
        <input
          className="border border-slate-300 rounded-xl px-4 py-3 w-full"
          placeholder="Napomena / obrazloženje odsustva"
          value={napomena}
          onChange={(e) => setNapomena(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <input
          className="border border-slate-300 rounded-xl px-4 py-3"
          placeholder="Pretraga zaposlenika"
          value={pretraga}
          onChange={(e) => setPretraga(e.target.value)}
        />

        <select
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={filterVrsta}
          onChange={(e) => setFilterVrsta(e.target.value)}
        >
          <option value="">
            Sve vrste
          </option>

          {vrsteOdsustva.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <select
          className="border border-slate-300 rounded-xl px-4 py-3"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">
            Svi statusi
          </option>

          <option value="na čekanju">
            Na čekanju
          </option>

          <option value="odobreno">
            Odobreno
          </option>

          <option value="odbijeno">
            Odbijeno
          </option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-4 text-left">Zaposlenik</th>
              <th className="p-4 text-left">Vrsta</th>
              <th className="p-4 text-left">Od</th>
              <th className="p-4 text-left">Do</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Napomena</th>

              {korisnik?.uloga === "admin" && (
                <th className="p-4 text-left">
                  Akcija
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {filtriraniZahtjevi.map((z) => (
              <tr key={z.id} className="border-b">
                <td className="p-3">
                  {z.zaposlenik?.ime}
                </td>

                <td className="p-3">
                  {z.vrsta || "Godišnji odmor"}
                </td>

                <td className="p-3">
                  {formatDatum(z.od)}
                </td>

                <td className="p-3">
                  {formatDatum(z.do)}
                </td>

                <td className="p-3 font-semibold">
                  {z.status}
                </td>

                <td className="p-3">
                  {z.napomena || "-"}
                </td>

                {korisnik?.uloga === "admin" && (
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        promijeniStatus(z.id, "odobreno")
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg"
                    >
                      Odobri
                    </button>

                    <button
                      onClick={() =>
                        promijeniStatus(z.id, "odbijeno")
                      }
                      className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Odbij
                    </button>

                    {z.status === "odobreno" && (
                      <>
                        <button
                          onClick={() =>
                            otvoriDokument(z, "odobrenje")
                          }
                          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
                        >
                          Odobrenje
                        </button>

                        <button
                          onClick={() =>
                            otvoriDokument(z, "rjesenje")
                          }
                          className="bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
                        >
                          Rješenje
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => obrisiOdsustvo(z.id)}
                      className="bg-slate-500 hover:bg-slate-400 text-white px-4 py-2 rounded-lg"
                    >
                      Obriši
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filtriraniZahtjevi.length === 0 && (
          <div className="p-6 text-slate-500">
            Nema pronađenih odsustava.
          </div>
        )}
      </div>
    </div>
  );
}

export default Godisnji;