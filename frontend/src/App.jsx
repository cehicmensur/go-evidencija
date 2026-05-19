import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Zaposlenici from "./pages/Zaposlenici";
import Godisnji from "./pages/Godisnji";
import Login from "./pages/Login";
import Kalendar from "./pages/Kalendar";

function App() {
  const korisnik = localStorage.getItem("korisnik");

  if (!korisnik) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />

        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/zaposlenici"
              element={<Zaposlenici />}
            />
            <Route
              path="/godisnji"
              element={<Godisnji />}
            />
            <Route
  path="/kalendar"
  element={<Kalendar />}
/>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;