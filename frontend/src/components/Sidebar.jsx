import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

function Sidebar() {
  const korisnik = JSON.parse(localStorage.getItem("korisnik"));
  const token = localStorage.getItem("token");

  const [pendingCount, setPendingCount] = useState(0);
  const previousCount = useRef(null);

  useEffect(() => {
    if (korisnik?.uloga !== "admin") return;

    const ucitajPending = async () => {
      try {
        const res = await fetch(
          "https://go-evidencija-backend.onrender.com/godisnji",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!Array.isArray(data)) return;

        const count = data.filter(
          (z) => z.status === "na čekanju"
        ).length;

        if (
          previousCount.current !== null &&
          count > previousCount.current
        ) {
          toast.success("🔔 Novi zahtjev za odsustvo zaprimljen");
        }

        previousCount.current = count;
        setPendingCount(count);
      } catch (error) {
        console.error(error);
      }
    };

    ucitajPending();

    const interval = setInterval(ucitajPending, 30000);

    return () => clearInterval(interval);
  }, [korisnik?.uloga, token]);

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

          {korisnik?.uloga === "admin" && (
            <Link to="/" className="hover:text-slate-300">
              Dashboard
            </Link>
          )}

          {korisnik?.uloga === "admin" && (
            <Link
              to="/zaposlenici"
              className="hover:text-slate-300"
            >
              Zaposlenici
            </Link>
          )}

          {korisnik?.uloga === "admin" && (
<Link
  to="/radni-staz"
  className="hover:text-slate-300 text-red-400"
>
Radni staž
</Link>
)}

          {korisnik?.uloga === "admin" && (
            <Link
              to="/korisnici"
              className="hover:text-slate-300"
            >
              Korisnici
            </Link>
          )}

          <Link
            to="/godisnji"
            className="hover:text-slate-300 flex items-center justify-between"
          >
            <span>
              {korisnik?.uloga === "admin"
                ? "Odsustva"
                : "Moja odsustva"}
            </span>

            {korisnik?.uloga === "admin" &&
              pendingCount > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  {pendingCount}
                </span>
              )}
          </Link>

          {korisnik?.uloga === "admin" && (
            <Link
              to="/kalendar"
              className="hover:text-slate-300"
            >
              Kalendar
            </Link>
          )}

          {korisnik?.uloga === "admin" && (
            <Link
              to="/neradni-dani"
              className="hover:text-slate-300"
            >
              Neradni dani
            </Link>
          )}

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