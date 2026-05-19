import { useState } from "react";

function Login() {
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [zaposlenikId, setZaposlenikId] = useState("");

  const API_URL = "https://go-evidencija-backend.onrender.com";

  const login = () => {
    fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, lozinka }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("korisnik", JSON.stringify(data.korisnik));

        window.location.href = "/";
      });
  };

  const register = () => {
    if (!ime || !email || !lozinka || !zaposlenikId) {
      alert("Popunite sva polja za registraciju.");
      return;
    }

    fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ime,
        email,
        lozinka,
        zaposlenikId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        alert(data.message);
        setIme("");
        setEmail("");
        setLozinka("");
        setZaposlenikId("");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center">
          GO Sistem
        </h1>

        <p className="text-slate-500 text-center mb-8">
          Prijava i registracija zaposlenika
        </p>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border rounded-xl px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Lozinka"
            className="border rounded-xl px-4 py-3"
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
          />

          <button
            onClick={login}
            className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-3"
          >
            Prijava
          </button>

          <hr className="my-4" />

          <h2 className="text-xl font-semibold">
            Registracija zaposlenika
          </h2>

          <input
            type="text"
            placeholder="Ime i prezime"
            className="border rounded-xl px-4 py-3"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
          />

          <input
            type="number"
            placeholder="ID zaposlenika"
            className="border rounded-xl px-4 py-3"
            value={zaposlenikId}
            onChange={(e) => setZaposlenikId(e.target.value)}
          />

          <button
            onClick={register}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3"
          >
            Pošalji zahtjev za registraciju
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;