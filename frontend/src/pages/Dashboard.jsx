import { useEffect, useState } from "react";

function Dashboard() {
const [zaposlenici, setZaposlenici] = useState([]);
const [odsustva, setOdsustva] = useState([]);
const [greska, setGreska] = useState("");
const [prikaziOdsutne, setPrikaziOdsutne] = useState(false);

const token = localStorage.getItem("token");
const korisnik = JSON.parse(localStorage.getItem("korisnik"));

const API_URL = "https://go-evidencija-backend.onrender.com";

useEffect(() => {
const ucitajPodatke = () => {
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
      setGreska("Greška kod učitavanja odsustava.");
    });

  if (korisnik?.uloga === "admin") {
    fetch(`${API_URL}/zaposlenici`, {
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

        setZaposlenici(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setGreska("Greška kod učitavanja zaposlenika.");
      });
  }
};

ucitajPodatke();

const interval = setInterval(ucitajPodatke, 30000);

return () => clearInterval(interval);

}, []);

const ukupnoZaposlenika = zaposlenici.length;

const ukupnoGO = zaposlenici.reduce(
(sum, z) => sum + (z.godisnji || 0),
0
);

const ukupnoIskoristeno = zaposlenici.reduce(
(sum, z) => sum + (z.iskoristeno || 0),
0
);

const ukupnoPreostalo = zaposlenici.reduce(
(sum, z) => sum + (z.preostalo || 0),
0
);

const naCekanju = odsustva.filter(
(o) => o.status === "na čekanju"
).length;

const odobreno = odsustva.filter(
(o) => o.status === "odobreno"
).length;

const odbijeno = odsustva.filter(
(o) => o.status === "odbijeno"
).length;

const ukupnoZahtjeva = odsustva.length;

const danas = new Date();

const ovajMjesec = odsustva.filter((o) => {
  const datum = new Date(o.od);

  return (
    datum.getMonth() === danas.getMonth() &&
    datum.getFullYear() === danas.getFullYear()
  );
}).length;

const listaTrenutnoOdsutnih = odsustva.filter((o) => {
  if (!o) return false;

  if (o.status !== "odobreno") return false;

  if (!o.od || !o.do) return false;

  const od = new Date(o.od);
  const doDatum = new Date(o.do);

  if (isNaN(od.getTime()) || isNaN(doDatum.getTime())) {
    return false;
  }

  return danas >= od && danas <= doDatum;
});

const trenutnoNaOdsustvu = listaTrenutnoOdsutnih.length;
const sljedecaOdsustva = [...odsustva]
  .filter((o) => {
    if (o.status !== "odobreno") return false;

    const od = new Date(o.od);

    return od > danas;
  })
  .sort((a, b) => new Date(a.od) - new Date(b.od))
  .slice(0, 5);

return ( 
<div> 
  <h1 className="text-4xl font-bold mb-2">
Dashboard </h1>

  <p className="text-slate-500 mb-8">
    Pregled stanja godišnjih odmora i odsustava
  </p>

  {greska && (
    <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6">
      {greska}
    </div>
  )}

  {korisnik?.uloga === "admin" && (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-slate-500 mb-2">
          Zaposlenici
        </p>
        <h2 className="text-5xl font-bold text-slate-800">
          {ukupnoZaposlenika}
        </h2>
      </div>
    </div>
  )}

  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
<div
  onClick={() => setPrikaziOdsutne(true)}
  className="bg-white rounded-2xl shadow p-6 cursor-pointer hover:bg-blue-50 transition"
>
  <p className="text-slate-500 mb-2">
    Trenutno na odsustvu
  </p>

  <h2 className="text-5xl font-bold text-blue-600">
    {trenutnoNaOdsustvu}
  </h2>

  <p className="text-xs text-slate-400 mt-2">
    Klikni za pregled zaposlenika
  </p>
</div>

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500 mb-2">
        Na čekanju
      </p>
      <h2 className="text-5xl font-bold text-yellow-600">
        {naCekanju}
      </h2>
    </div>

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500 mb-2">
        Ukupno zahtjeva
      </p>
      <h2 className="text-5xl font-bold text-slate-800">
        {ukupnoZahtjeva}
      </h2>
    </div>
  </div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

  <div className="bg-white rounded-2xl shadow p-6">
    <h2 className="text-xl font-bold mb-4 text-green-700">
      Trenutno na odsustvu
    </h2>

    {listaTrenutnoOdsutnih.length === 0 ? (
      <p className="text-slate-500">
        Nema zaposlenika na odsustvu.
      </p>
    ) : (
[...listaTrenutnoOdsutnih]
  .sort((a, b) => new Date(a.do) - new Date(b.do))
  .map((o) => (
        <div
          key={o.id}
          className="flex justify-between items-center border-b py-2"
        >
          <div>
            <div className="font-semibold">
              {o.zaposlenik?.ime}
            </div>

            <div className="text-sm text-slate-500">
              {o.vrsta}
            </div>
          </div>

          <div className="text-sm text-slate-600">
            do {new Date(o.do).toLocaleDateString("bs-BA")}
          </div>
        </div>
      ))
    )}
  </div>

  <div className="bg-white rounded-2xl shadow p-6">
    <h2 className="text-xl font-bold mb-4 text-blue-700">
      Sljedeća odsustva
    </h2>

    {sljedecaOdsustva.length === 0 ? (
      <p className="text-slate-500">
        Nema planiranih odsustava.
      </p>
    ) : (
      sljedecaOdsustva.map((o) => (
        <div
          key={o.id}
          className="flex justify-between items-center border-b py-2"
        >
          <div>
            <div className="font-semibold">
              {o.zaposlenik?.ime}
            </div>

            <div className="text-sm text-slate-500">
              {o.vrsta}
            </div>
          </div>

<div className="text-sm text-slate-600 text-right">
  <div>
    {new Date(o.od).toLocaleDateString("bs-BA")}
  </div>
  <div>
    {new Date(o.do).toLocaleDateString("bs-BA")}
  </div>
</div>
        </div>
      ))
    )}
  </div>

</div>

  {prikaziOdsutne && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Trenutno odsutni zaposlenici
        </h2>

        <button
          onClick={() => setPrikaziOdsutne(false)}
          className="text-red-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {listaTrenutnoOdsutnih.length === 0 ? (
        <p className="text-slate-500">
          Trenutno nema zaposlenika na odsustvu.
        </p>
      ) : (
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-3 text-left">Zaposlenik</th>
              <th className="p-3 text-left">Vrsta</th>
              <th className="p-3 text-left">Od</th>
              <th className="p-3 text-left">Do</th>
            </tr>
          </thead>

          <tbody>
            {listaTrenutnoOdsutnih.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="p-3">{o.zaposlenik?.ime}</td>

                <td className="p-3">
                  {o.vrsta || "Godišnji odmor"}
                </td>

                <td className="p-3">
                  {new Date(o.od).toLocaleDateString("bs-BA")}
                </td>

                <td className="p-3">
                  {new Date(o.do).toLocaleDateString("bs-BA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
)}

    </div>
  );
}

export default Dashboard; 