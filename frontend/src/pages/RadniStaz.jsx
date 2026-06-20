import { useEffect, useState } from "react";

function RadniStaz() {
  const [zaposlenici, setZaposlenici] = useState([]);
  const [zaposlenikId, setZaposlenikId] = useState("");
  const [poslodavac, setPoslodavac] = useState("");
  const [datumOd, setDatumOd] = useState("");
  const [datumDo, setDatumDo] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = "https://go-evidencija-backend.onrender.com";

  useEffect(() => {
    fetch(`${API_URL}/zaposlenici`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setZaposlenici(data))
      .catch(console.error);
  }, []);

  const dodaj = async () => {
    if (
      !zaposlenikId ||
      !poslodavac ||
      !datumOd ||
      !datumDo
    ) {
      alert("Popuni sva polja.");
      return;
    }

    await fetch(`${API_URL}/radni-staz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        zaposlenikId,
        poslodavac,
        datumOd,
        datumDo,
      }),
    });

    setPoslodavac("");
    setDatumOd("");
    setDatumDo("");

    alert("Radni staž dodan.");
  };

  return (
    <div>
    <h1 className="text-4xl font-bold mb-8 text-red-600">
  RADNI STAZ TEST 123
</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <select
          className="border rounded-xl px-4 py-3"
          value={zaposlenikId}
          onChange={(e) =>
            setZaposlenikId(e.target.value)
          }
        >
          <option value="">
            Odaberi zaposlenika
          </option>

          {zaposlenici.map((z) => (
            <option key={z.id} value={z.id}>
              {z.ime}
            </option>
          ))}
        </select>

        <input
          className="border rounded-xl px-4 py-3"
          placeholder="Poslodavac"
          value={poslodavac}
          onChange={(e) =>
            setPoslodavac(e.target.value)
          }
        />

        <input
          type="date"
          className="border rounded-xl px-4 py-3"
          value={datumOd}
          onChange={(e) =>
            setDatumOd(e.target.value)
          }
        />

        <input
          type="date"
          className="border rounded-xl px-4 py-3"
          value={datumDo}
          onChange={(e) =>
            setDatumDo(e.target.value)
          }
        />

        <button
          onClick={dodaj}
          className="bg-slate-800 text-white rounded-xl"
        >
          Dodaj
        </button>
      </div>
    </div>
  );
}

export default RadniStaz;