import { useState } from "react";

function Login() {
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [zaposlenikId, setZaposlenikId] = useState("");

  const login = () => {
    fetch("http://localhost:3000/login", {
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

  const registerAdmin = () => {
    fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ime: ime || "Admin",
        email,
        lozinka,
        uloga: "admin",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        alert("Admin registrovan. Sada klikni Prijava.");
      });
  };

  const registerZaposlenik = () => {
    fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ime,
        email,
        lozinka,
        uloga: "zaposlenik",
        zaposlenikId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          return;
        }

        alert("Zaposlenik registrovan. Sada klikni Prijava.");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Login
        </h1>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Ime"
            className="border rounded-xl px-4 py-3"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
          />

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

          <input
            type="number"
            placeholder="ID zaposlenika (samo za zaposlenika)"
            className="border rounded-xl px-4 py-3"
            value={zaposlenikId}
            onChange={(e) => setZaposlenikId(e.target.value)}
          />

          <button
            onClick={login}
            className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-3"
          >
            Prijava
          </button>

          <button
            onClick={registerAdmin}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3"
          >
            Registruj admina
          </button>

          <button
            onClick={registerZaposlenik}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3"
          >
            Registruj zaposlenika
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;