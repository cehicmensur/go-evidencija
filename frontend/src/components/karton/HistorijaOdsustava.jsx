function HistorijaOdsustava({ zaposlenik }) {

  const token = localStorage.getItem("token");

  const API_URL =
    "https://go-evidencija-backend.onrender.com";

  const otvoriDokument = async (odsustvo, tip) => {
    try {
      const res = await fetch(
        `${API_URL}/neradni-dani`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const neradniDani = await res.json();

      localStorage.setItem(
        "dokumentOdsustva",
        JSON.stringify(odsustvo)
      );

      localStorage.setItem(
        "neradniDani",
        JSON.stringify(neradniDani)
      );

      localStorage.setItem(
        "tipDokumenta",
        tip
      );

      window.open(
        "/dokument-odsustva",
        "_blank"
      );

    } catch (error) {
      console.error(error);

      alert(
        "Greška kod učitavanja neradnih dana."
      );
    }
  };

  const odsustva = [...(zaposlenik.odmori || [])].sort(
    (a, b) => new Date(b.od) - new Date(a.od)
  );

  const ukupnoOdsustava = odsustva.length;

const ukupnoDana = odsustva.reduce(
  (ukupno, o) => ukupno + (o.brojDana || 0),
  0
);

const daniGodisnji = odsustva
  .filter((o) => o.vrsta === "Godišnji odmor")
  .reduce(
    (ukupno, o) => ukupno + (o.brojDana || 0),
    0
  );

const daniOstali = odsustva
  .filter((o) => o.vrsta !== "Godišnji odmor")
  .reduce(
    (ukupno, o) => ukupno + (o.brojDana || 0),
    0
  );

  const statusBoja = (status) => {
    switch (status) {
      case "odobreno":
        return "bg-green-100 text-green-700";

      case "odbijeno":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-2xl font-bold border-b pb-4 mb-6">
        📋 Historija odsustava
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

  <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl p-5 shadow-lg">
    <p className="text-sm opacity-80">
      Ukupno odsustava
    </p>

    <p className="text-3xl font-bold mt-2">
      {ukupnoOdsustava}
    </p>
  </div>

  <div className="bg-green-600 text-white rounded-xl p-5 shadow">
    <p className="text-sm opacity-80">
      Ukupno dana
    </p>

    <p className="text-3xl font-bold mt-2">
      {ukupnoDana}
    </p>
  </div>

<div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white rounded-2xl p-5 shadow-lg">

  <p className="text-sm opacity-80">
    Godišnji odmor
  </p>

  <p className="text-4xl font-bold mt-2">
    {daniGodisnji}
  </p>

  <p className="text-sm mt-1 opacity-80">
    dana
  </p>

</div>

<div className="bg-slate-700 text-white rounded-xl p-5 shadow">

  <p className="text-sm opacity-80">
    Ostala odsustva
  </p>

  <p className="text-4xl font-bold mt-2">
    {daniOstali}
  </p>

  <p className="text-sm mt-1 opacity-80">
    dana
  </p>

</div>

</div>

      {odsustva.length === 0 ? (

        <div className="text-center py-12 text-slate-500">
          Nema evidentiranih odsustava.
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-4 text-left">
                  Vrsta
                </th>

                <th className="p-4 text-left">
                  Period
                </th>

                <th className="p-4 text-center">
                  Dana
                </th>

                <th className="p-4 text-center">
                  Status
                </th>

                <th className="p-4 text-center">
                  Odbija od GO
                </th>

                <th className="p-4 text-left">
                  Napomena
                </th>

                <th className="p-4 text-center">
  Rješenje
</th>

              </tr>

            </thead>

            <tbody>

              {odsustva.map((o) => (

                <tr
                  key={o.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4 font-medium">
                    {o.vrsta}
                  </td>

                  <td className="p-4">

                    {new Date(
                      o.od
                    ).toLocaleDateString("bs-BA")}

                    {" - "}

                    {new Date(
                      o.do
                    ).toLocaleDateString("bs-BA")}

                  </td>

                  <td className="p-4 text-center font-semibold">
                    {o.brojDana ?? "-"}
                  </td>

                  <td className="p-4 text-center">

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBoja(
                        o.status
                      )}`}
                    >
                      {o.status}
                    </span>

                  </td>

                  <td className="p-4 text-center text-lg">

                    {o.odbijaSeOdGodisnjeg
                      ? "✅"
                      : "❌"}

                  </td>

                  <td className="p-4">

                    {o.napomena || "-"}

                  </td>

                  <td className="p-4 text-center">

<button
  onClick={() =>
    otvoriDokument(o, "rjesenje")
  }
  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
>
  📄
</button>

</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default HistorijaOdsustava;