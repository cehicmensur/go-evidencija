function KartonZaposlenika({
  otvoren,
  zaposlenik,
  onClose,
}) {
  if (!otvoren || !zaposlenik) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">

        {/* ZAGLAVLJE */}

        <div className="flex justify-between items-start border-b px-8 py-6">

          <div>
            <h2 className="text-3xl font-bold">
              👤 Karton zaposlenika
            </h2>

            <p className="text-xl font-semibold mt-2">
              {zaposlenik.ime}
            </p>

            <p className="text-slate-500">
              {zaposlenik.pozicija}
            </p>

            <div className="mt-4">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                🟢 Prisutan
              </span>
            </div>

          </div>

          <button
            onClick={onClose}
            className="text-3xl text-red-600 hover:text-red-700"
          >
            ×
          </button>

        </div>

        {/* SADRŽAJ */}

        <div className="p-8 space-y-6">

          {/* OSNOVNI PODACI */}

          <div className="bg-slate-50 rounded-xl p-6">

            <h3 className="text-xl font-bold mb-5">
              👤 Osnovni podaci
            </h3>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <p className="text-slate-500">
                  Ime i prezime
                </p>
                <p className="font-semibold text-lg">
                  {zaposlenik.ime}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Pozicija
                </p>
                <p className="font-semibold text-lg">
                  {zaposlenik.pozicija}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Datum početka rada
                </p>
                <p className="font-semibold text-lg">
                  {zaposlenik.datumPocetka
                    ? new Date(
                        zaposlenik.datumPocetka
                      ).toLocaleDateString("bs-BA")
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Trenutni godišnji odmor
                </p>
                <p className="font-semibold text-lg">
                  {zaposlenik.godisnji} dana
                </p>
              </div>

            </div>

          </div>

          {/* RADNI ODNOS */}

          <div className="bg-slate-50 rounded-xl p-6">

            <h3 className="text-xl font-bold mb-4">
              📋 Radni odnos
            </h3>

            <p className="text-slate-500">
              Ovdje ćemo prikazati radni staž u MIZ, prethodni staž i ukupan staž.
            </p>

          </div>

          {/* GODIŠNJI ODMOR */}

          <div className="bg-slate-50 rounded-xl p-6">

            <h3 className="text-xl font-bold mb-4">
              🌴 Godišnji odmor
            </h3>

            <p className="text-slate-500">
              Ovdje ćemo prikazati obračunski period, iskorišteno i preostalo.
            </p>

          </div>

          {/* OBRAČUN */}

          <div className="bg-slate-50 rounded-xl p-6">

            <h3 className="text-xl font-bold mb-4">
              🧮 Obračun godišnjeg odmora
            </h3>

            <p className="text-slate-500">
              Ovdje će biti detaljan automatski obračun prema Pravilniku.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default KartonZaposlenika;