import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Sidebar() {
  const korisnik = JSON.parse(localStorage.getItem("korisnik"));
  const [pendingCount, setPendingCount] = useState(0);

const token = localStorage.getItem("token");

useEffect(() => {
  if (korisnik?.uloga !== "admin") return;

  const ucitajPending = () => {
  fetch("https://go-evidencija-backend.onrender.com/godisnji", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (!Array.isArray(data)) return;

      const count = data.filter(
        (z) => z.status === "na čekanju"
      ).length;

      setPendingCount(count);
    })
    .catch(console.error);
};

ucitajPending();

const interval = setInterval(ucitajPending, 30000);

return () => clearInterval(interval);
}, []);

  const logout = () => {
    localStorage.removeItem("korisnik");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="w-64 bg-slate-800 text-white p-6 min-h-screen flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-10">
          GO Sistem
        </h1>

        <div className="flex flex-col gap-4">
          <Link to="/" className="hover:text-slate-300">
            Dashboard
          </Link>

          {korisnik?.uloga === "admin" && (
            <Link to="/zaposlenici" className="hover:text-slate-300">
              Zaposlenici
            </Link>
          )}
{korisnik?.uloga === "admin" && (
  <Link to="/korisnici" className="hover:text-slate-300">
    Korisnici
  </Link>
)}
         <Link
  to="/godisnji"
  className="hover:text-slate-300 flex items-center justify-between"
>
  <span>Odsustva</span>

  {korisnik?.uloga === "admin" && pendingCount > 0 && (
    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
      {pendingCount}
    </span>
  )}
</Link>
          <Link to="/kalendar" className="hover:text-slate-300">
  Kalendar
</Link>
        </div>
      </div>

      <div className="border-t border-slate-600 pt-4">
        <p className="text-sm text-slate-300">
          {korisnik?.ime || "Korisnik"}
        </p>

        <p className="text-xs text-slate-400 mb-3">
          Uloga: {korisnik?.uloga || "nepoznato"}
        </p>

        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg"
        >
          Odjava
        </button>
      </div>
    </div>
  );
}

export default Sidebar;