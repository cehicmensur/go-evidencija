import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

function KriterijiGO({
  zaposlenik,
  setZaposlenik,
}) {
  const token = localStorage.getItem("token");

  const [forma, setForma] = useState({
    brojDjeceU15: 0,
    samohraniRoditelj: false,
    invaliditet: false,
    mjeseciARBiH: 0,
    nivoSluzbenickogMjesta: "",
    ocjenaRezultata: "",
  });

  useEffect(() => {
    if (!zaposlenik) return;

    setForma({
      brojDjeceU15: zaposlenik.brojDjeceU15 || 0,
      samohraniRoditelj: zaposlenik.samohraniRoditelj || false,
      invaliditet: zaposlenik.invaliditet || false,
      mjeseciARBiH: zaposlenik.mjeseciARBiH || 0,
      nivoSluzbenickogMjesta:
        zaposlenik.nivoSluzbenickogMjesta || "",
      ocjenaRezultata:
        zaposlenik.ocjenaRezultata || "",
    });
  }, [zaposlenik]);

  const obracun = zaposlenik?.obracun || {
    osnovica: 20,
    dodatakStaz: 0,
    dodatakDjeca: 0,
    dodatakInvaliditet: 0,
    dodatakARBiH: 0,
    dodatakMjesto: 0,
    dodatakOcjena: 0,
    ukupno: zaposlenik?.godisnji || 20,
  };

  function promjena(e) {
    const { name, value, type, checked } = e.target;

    setForma((old) => ({
      ...old,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function sacuvaj() {
    try {
      const res = await fetch(
        `${API}/zaposlenici/${zaposlenik.id}/kriteriji`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(forma),
        }
      );

      if (!res.ok) {
        throw new Error("Greška prilikom spremanja kriterija.");
      }

      const res2 = await fetch(
        `${API}/zaposlenici/${zaposlenik.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res2.ok) {
        throw new Error("Greška prilikom osvježavanja podataka.");
      }

      const novi = await res2.json();

      setZaposlenik(novi);

      toast.success("Kriteriji su uspješno sačuvani.");
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  }

  if (!zaposlenik) return null;

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-semibold border-b pb-3 mb-6">
          ⚙️ Kriteriji za obračun godišnjeg odmora
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
            <label className="block font-medium mb-2">
              Broj djece mlađe od 15 godina
            </label>

            <input
              type="number"
              name="brojDjeceU15"
              value={forma.brojDjeceU15}
              onChange={promjena}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div className="flex items-center gap-3 mt-8">
            <input
              type="checkbox"
              name="samohraniRoditelj"
              checked={forma.samohraniRoditelj}
              onChange={promjena}
            />

            <label>Samohrani roditelj</label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="invaliditet"
              checked={forma.invaliditet}
              onChange={promjena}
            />

            <label>
              Invaliditet / hronična ili teška bolest
            </label>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Mjeseci u Armiji RBiH
            </label>

            <input
              type="number"
              name="mjeseciARBiH"
              value={forma.mjeseciARBiH}
              onChange={promjena}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Službeničko mjesto
            </label>

            <select
              name="nivoSluzbenickogMjesta"
              value={forma.nivoSluzbenickogMjesta}
              onChange={promjena}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Odaberi...</option>
              <option>Stručni saradnik</option>
              <option>Viši stručni saradnik</option>
              <option>Stručni savjetnik</option>
              <option>Voditelj / šef</option>
              <option>Rukovodeći službenik</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Ocjena rezultata rada
            </label>

            <select
              name="ocjenaRezultata"
              value={forma.ocjenaRezultata}
              onChange={promjena}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Odaberi...</option>
              <option>Uspješan</option>
              <option>Naročito uspješan</option>
              <option>Izuzetan doprinos</option>
            </select>
          </div>

        </div>

        <div className="mt-8">
          <button
            onClick={sacuvaj}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Sačuvaj kriterije
          </button>
        </div>

      </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">

        <h2 className="text-lg font-semibold mb-5">
          Pregled obračuna godišnjeg odmora
        </h2>

        <div className="space-y-3">

          <div className="flex justify-between">
            <span>Osnovica</span>
            <strong>{obracun.osnovica} dana</strong>
          </div>

          <div className="flex justify-between">
            <span>Dodatak po stažu</span>
            <strong>+{obracun.dodatakStaz}</strong>
          </div>

          <div className="flex justify-between">
            <span>Dodatak po djeci</span>
            <strong>+{obracun.dodatakDjeca}</strong>
          </div>

          <div className="flex justify-between">
            <span>Invaliditet / hronična bolest</span>
            <strong>+{obracun.dodatakInvaliditet}</strong>
          </div>

          <div className="flex justify-between">
            <span>Učešće u Armiji RBiH</span>
            <strong>+{obracun.dodatakARBiH}</strong>
          </div>

          <div className="flex justify-between">
            <span>Službeničko mjesto</span>
            <strong>+{obracun.dodatakMjesto}</strong>
          </div>

          <div className="flex justify-between">
            <span>Ocjena rezultata rada</span>
            <strong>+{obracun.dodatakOcjena}</strong>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between text-xl font-bold text-blue-700">
            <span>UKUPNO</span>
            <span>{obracun.ukupno} dana</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default KriterijiGO;