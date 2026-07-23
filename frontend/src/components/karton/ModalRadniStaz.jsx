import { useEffect, useState } from "react";

function ModalRadniStaz({
  otvoren,
  onClose,
  zaposlenikId,
  token,
  API_URL,
  onSacuvano,
  stavka = null,
}) {
  const [poslodavac, setPoslodavac] = useState("");
  const [datumOd, setDatumOd] = useState("");
  const [datumDo, setDatumDo] = useState("");
  const [snima, setSnima] = useState(false);
  useEffect(() => {
  if (stavka) {
    setPoslodavac(stavka.poslodavac);

    setDatumOd(
      stavka.datumOd.substring(0, 10)
    );

    setDatumDo(
      stavka.datumDo.substring(0, 10)
    );
  } else {
    setPoslodavac("");
    setDatumOd("");
    setDatumDo("");
  }
}, [stavka, otvoren]);

  if (!otvoren) return null;

  const sacuvaj = async () => {
    if (
      !poslodavac ||
      !datumOd ||
      !datumDo
    ) {
      alert("Popunite sva polja.");
      return;
    }

    try {
      setSnima(true);

const url = stavka
  ? `${API_URL}/radni-staz/${stavka.id}`
  : `${API_URL}/radni-staz`;

const metoda = stavka
  ? "PUT"
  : "POST";

const res = await fetch(
  url,
  {
    method: metoda,
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            zaposlenikId,
            poslodavac,
            datumOd,
            datumDo,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(
          "Greška pri snimanju."
        );
      }

      setPoslodavac("");
      setDatumOd("");
      setDatumDo("");

      onClose();

      if (onSacuvano) {
        onSacuvano();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSnima(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">

        <h2 className="text-2xl font-bold mb-6">
{stavka
  ? "Uređivanje radnog staža"
  : "Dodavanje radnog staža"}
        </h2>

        <div className="space-y-5">

          <div>

            <label className="block mb-2 font-medium">
              Poslodavac
            </label>

            <input
              type="text"
              value={poslodavac}
              onChange={(e) =>
                setPoslodavac(
                  e.target.value
                )
              }
              className="w-full border rounded-xl px-4 py-3"
            />

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block mb-2 font-medium">
                Datum od
              </label>

              <input
                type="date"
                value={datumOd}
                onChange={(e) =>
                  setDatumOd(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

            <div>

              <label className="block mb-2 font-medium">
                Datum do
              </label>

              <input
                type="date"
                value={datumDo}
                onChange={(e) =>
                  setDatumDo(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>

          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border"
          >
            Odustani
          </button>

          <button
            onClick={sacuvaj}
            disabled={snima}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl"
          >
{snima
  ? "Spremanje..."
  : stavka
    ? "Sačuvaj izmjene"
    : "Sačuvaj"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ModalRadniStaz;