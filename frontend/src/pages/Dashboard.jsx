import { useEffect, useState } from "react";

function Dashboard() {
const [zaposlenici, setZaposlenici] = useState([]);
const [odsustva, setOdsustva] = useState([]);
const [greska, setGreska] = useState("");

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

const trenutnoNaOdsustvu = odsustva.filter((o) => {
  if (!o) return false;

  if (o.status !== "odobreno") return false;

  if (!o.od || !o.do) return false;

  const od = new Date(o.od);
  const doDatum = new Date(o.do);

  if (isNaN(od.getTime()) || isNaN(doDatum.getTime())) {
    return false;
  }

  return danas >= od && danas <= doDatum;
}).length;

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

      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-slate-500 mb-2">
          Ukupno GO
        </p>
        <h2 className="text-5xl font-bold text-slate-800">
          {ukupnoGO}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-slate-500 mb-2">
          Iskorišteno
        </p>
        <h2 className="text-5xl font-bold text-orange-600">
          {ukupnoIskoristeno}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-slate-500 mb-2">
          Preostalo
        </p>
        <h2 className="text-5xl font-bold text-emerald-700">
          {ukupnoPreostalo}
        </h2>
      </div>
    </div>
  )}

  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500 mb-2">
        Trenutno na odsustvu
      </p>
      <h2 className="text-5xl font-bold text-blue-600">
        {trenutnoNaOdsustvu}
      </h2>
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
        Odobreno
      </p>
      <h2 className="text-5xl font-bold text-emerald-700">
        {odobreno}
      </h2>
    </div>

    <div className="bg-white rounded-2xl shadow p-6">
      <p className="text-slate-500 mb-2">
        Odbijeno
      </p>
      <h2 className="text-5xl font-bold text-red-600">
        {odbijeno}
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

  <div className="bg-white rounded-2xl shadow p-6">
    <h2 className="text-2xl font-bold mb-4">
      Zadnja odsustva
    </h2>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="p-3 text-left">
              Zaposlenik
            </th>
            <th className="p-3 text-left">
              Vrsta
            </th>
            <th className="p-3 text-left">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {odsustva.slice(0, 5).map((o) => (
            <tr key={o.id} className="border-b">
              <td className="p-3">
                {o.zaposlenik?.ime || korisnik?.ime}
              </td>

              <td className="p-3">
                {o.vrsta || "Godišnji odmor"}
              </td>

              <td className="p-3 font-semibold">
                {o.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {odsustva.length === 0 && (
      <p className="text-slate-500 mt-4">
        Nema evidentiranih odsustava.
      </p>
    )}
  </div>
    </div>
  );
}

export default Dashboard; 