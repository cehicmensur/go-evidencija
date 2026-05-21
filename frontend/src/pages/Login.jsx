import { useEffect, useState } from "react";

function Login() {
  const [registracija, setRegistracija] = useState(false);

  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");

  const [zaposlenici, setZaposlenici] = useState([]);
  const [zaposlenikId, setZaposlenikId] = useState("");

  const [poruka, setPoruka] = useState("");

  const API_URL = "https://go-evidencija-backend.onrender.com";

  useEffect(() => {
    fetch(`${API_URL}/zaposlenici-javno`)
      .then((res) => res.json())
      .then((data) => {
        setZaposlenici(data);
      });
  }, []);

  const login = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          lozinka,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setPoruka(data.error);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "korisnik",
        JSON.stringify(data.korisnik)
      );

      window.location.reload();
    } catch (error) {
      console.error(error);
      setPoruka("Greška kod prijave.");
    }
  };

  const registruj = async () => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          lozinka,
          zaposlenikId,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setPoruka(data.error);
        return;
      }

      setPoruka(
        "Registracija uspješna. Administrator treba odobriti nalog."
      );

      setEmail("");
      setLozinka("");
      setZaposlenikId("");
    } catch (error) {
      console.error(error);
      setPoruka("Greška kod registracije.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800">
            GO Evidencija
          </h1>

          <p className="text-slate-500 mt-3">
            Medžlis Islamske zajednice Bihać
          </p>
        </div>

        {poruka && (
          <div className="mb-6 bg-slate-100 border border-slate-300 text-slate-700 p-4 rounded-xl text-sm">
            {poruka}
          </div>
        )}

        <div className="space-y-4">
          {registracija && (
            <select
              className="w-full border border-slate-300 rounded-xl px-4 py-3"
              value={zaposlenikId}
              onChange={(e) => setZaposlenikId(e.target.value)}
            >
              <option value="">
                Odaberi ime i prezime
              </option>

              {zaposlenici.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.ime}
                </option>
              ))}
            </select>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Lozinka"
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
          />

          {registracija ? (
            <button
              onClick={registruj}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold"
            >
              Registruj se
            </button>
          ) : (
            <button
              onClick={login}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-semibold"
            >
              Prijava
            </button>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setRegistracija(!registracija);
              setPoruka("");
            }}
            className="text-slate-600 hover:text-slate-800 text-sm"
          >
            {registracija
              ? "Već imate nalog? Prijava"
              : "Nemate nalog? Registracija"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;