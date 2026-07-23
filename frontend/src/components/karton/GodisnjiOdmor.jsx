function GodisnjiOdmor({ zaposlenik }) {
  const brojDanaGO =
    zaposlenik.obracunGO?.brojDanaGO ??
    ((zaposlenik.godisnji || 0) +
      (zaposlenik.dodatniDani || 0));

  const godina =
    zaposlenik.obracunGO?.godina ??
    new Date().getFullYear();

  const datumObracuna =
    zaposlenik.obracunGO?.datumObracuna;

  const obracun = zaposlenik.obracun || {};

  const odmori =
    zaposlenik.odmori
      ?.filter((o) => o.odbijaSeOdGodisnjeg)
      .sort(
        (a, b) =>
          new Date(b.od) - new Date(a.od)
      ) || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-bold border-b pb-4 mb-6">
        🏖 Godišnji odmor
      </h2>

      {/* PREGLED */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow">

          <p className="text-blue-100 text-sm uppercase tracking-wide">
            Broj dana GO
          </p>

          <p className="text-5xl font-bold mt-3">
            {brojDanaGO}
          </p>

          <p className="mt-2 text-blue-100">
            dana
          </p>

        </div>

        <div className="bg-orange-500 text-white rounded-2xl p-6 shadow">

          <p className="text-orange-100 text-sm uppercase tracking-wide">
            Iskorišteno
          </p>

          <p className="text-5xl font-bold mt-3">
            {zaposlenik.iskoristeno ?? 0}
          </p>

          <p className="mt-2 text-orange-100">
            dana
          </p>

        </div>

        <div className="bg-green-600 text-white rounded-2xl p-6 shadow">

          <p className="text-green-100 text-sm uppercase tracking-wide">
            Preostalo
          </p>

          <p className="text-5xl font-bold mt-3">
            {zaposlenik.preostalo ?? brojDanaGO}
          </p>

          <p className="mt-2 text-green-100">
            dana
          </p>

        </div>

      </div>

      {/* OBRAČUNSKA GODINA */}

      <div className="mt-8 bg-slate-50 border rounded-xl p-5">

        <h3 className="text-lg font-semibold mb-2">
          Obračunska godina
        </h3>

        <p className="text-slate-700 leading-7">
          Broj dana godišnjeg odmora obračunat je za
          <strong> {godina}. godinu</strong>.
          Neiskorišteni dio godišnjeg odmora može se koristiti
          do <strong>30.06.{godina + 1}.</strong>
        </p>

        {datumObracuna && (
          <p className="mt-3 text-slate-600">
            <strong>Datum obračuna:</strong>{" "}
            {new Date(datumObracuna).toLocaleDateString(
              "bs-BA"
            )}
          </p>
        )}

      </div>

      {/* OBRAČUN */}

      <div className="mt-8 bg-white border rounded-xl p-6">

        <h3 className="text-xl font-semibold mb-6">
          Obračun broja dana godišnjeg odmora
        </h3>

        <div className="space-y-3">

          <div className="flex justify-between border-b pb-2">
            <span>Osnovica</span>
            <strong>{obracun.osnovica || 20} dana</strong>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Dodatak po radnom stažu</span>
            <strong>+{obracun.dodatakStaz || 0}</strong>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Djeca do 15 godina</span>
            <strong>+{obracun.dodatakDjeca || 0}</strong>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Invaliditet</span>
            <strong>+{obracun.dodatakInvaliditet || 0}</strong>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Učešće u ARBiH</span>
            <strong>+{obracun.dodatakARBiH || 0}</strong>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Službeničko mjesto</span>
            <strong>+{obracun.dodatakMjesto || 0}</strong>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span>Ocjena rada</span>
            <strong>+{obracun.dodatakOcjena || 0}</strong>
          </div>

          <div className="flex justify-between pt-3 text-xl font-bold text-blue-700">
            <span>Ukupan broj dana GO</span>
            <span>{obracun.ukupno || brojDanaGO} dana</span>
          </div>

        </div>

        {(obracun.ukupno || brojDanaGO) >= 35 && (

          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">

            <p className="text-sm text-amber-800">
              <strong>Napomena:</strong> Ukupan broj dana godišnjeg odmora ograničen je na
              <strong> 35 radnih dana</strong> u skladu sa Pravilnikom o službi
              u Islamskoj zajednici u Bosni i Hercegovini.
            </p>

          </div>

        )}

      </div>

      {/* EVIDENCIJA */}

      <div className="mt-8 bg-white border rounded-xl p-6">

        <h3 className="text-xl font-semibold mb-5">
          Evidencija korištenja godišnjeg odmora
        </h3>

        {odmori.length === 0 ? (

          <div className="text-center py-8 text-slate-500">
            Nema evidentiranih godišnjih odmora.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-3 text-left">
                    Od
                  </th>

                  <th className="p-3 text-left">
                    Do
                  </th>

                  <th className="p-3 text-center">
                    Dana
                  </th>

                  <th className="p-3 text-center">
                    Status
                  </th>

                  <th className="p-3 text-left">
                    Vrsta
                  </th>

                </tr>

              </thead>

              <tbody>

                {odmori.map((o) => (

                  <tr
                    key={o.id}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-3">
                      {new Date(o.od).toLocaleDateString("bs-BA")}
                    </td>

                    <td className="p-3">
                      {new Date(o.do).toLocaleDateString("bs-BA")}
                    </td>

                    <td className="p-3 text-center font-semibold">
                      {o.brojDana}
                    </td>

                    <td className="p-3 text-center">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          o.status === "odobreno"
                            ? "bg-green-100 text-green-700"
                            : o.status === "na čekanju"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {o.status}
                      </span>

                    </td>

                    <td className="p-3">
                      {o.vrsta}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default GodisnjiOdmor;