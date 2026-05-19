import { Link } from "react-router-dom";

function Sidebar() {
  const korisnik = JSON.parse(localStorage.getItem("korisnik"));

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

          <Link to="/godisnji" className="hover:text-slate-300">
            Odsustva
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