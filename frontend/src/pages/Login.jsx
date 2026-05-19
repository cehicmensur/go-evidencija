import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");

  const login = () => {
    fetch("https://go-evidencija-backend.onrender.com/login", {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-2xl shadow w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">
          GO Sistem
        </h1>

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
        </div>
      </div>
    </div>
  );
}

export default Login;