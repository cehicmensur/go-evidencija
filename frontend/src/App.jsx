import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Zaposlenici from "./pages/Zaposlenici";
import Godisnji from "./pages/Godisnji";
import Korisnici from "./pages/Korisnici";
import DokumentOdsustva from "./pages/DokumentOdsustva";
import Kalendar from "./pages/Kalendar";
import NeradniDani from "./pages/NeradniDani";

import Sidebar from "./components/Sidebar";

function App() {
  const token = localStorage.getItem("token");
  const korisnik = JSON.parse(localStorage.getItem("korisnik"));

  if (!token) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />

        <main className="flex-1 p-8">
          <Routes>

            <Route
              path="/"
              element={
                korisnik?.uloga === "admin" ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/godisnji" />
                )
              }
            />

            <Route
              path="/zaposlenici"
              element={
                korisnik?.uloga === "admin" ? (
                  <Zaposlenici />
                ) : (
                  <Navigate to="/godisnji" />
                )
              }
            />

            <Route
              path="/korisnici"
              element={
                korisnik?.uloga === "admin" ? (
                  <Korisnici />
                ) : (
                  <Navigate to="/godisnji" />
                )
              }
            />

            <Route
              path="/godisnji"
              element={<Godisnji />}
            />

            <Route
              path="/kalendar"
              element={
                korisnik?.uloga === "admin" ? (
                  <Kalendar />
                ) : (
                  <Navigate to="/godisnji" />
                )
              }
            />

            <Route
              path="/neradni-dani"
              element={
                korisnik?.uloga === "admin" ? (
                  <NeradniDani />
                ) : (
                  <Navigate to="/godisnji" />
                )
              }
            />

            <Route
              path="/dokument-odsustva"
              element={<DokumentOdsustva />}
            />

            <Route
              path="*"
              element={
                korisnik?.uloga === "admin" ? (
                  <Navigate to="/" />
                ) : (
                  <Navigate to="/godisnji" />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;