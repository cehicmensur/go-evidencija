function RadniOdnos({ zaposlenik }) {
  const kartice = [
    {
      naslov: "Staž u MIZ",
      godine: zaposlenik.godineUMIZ,
      mjeseci: zaposlenik.mjeseciUMIZ,
      dani: zaposlenik.daniUMIZ,
    },
    {
      naslov: "Prethodni radni staž",
      godine: zaposlenik.prethodniGodina,
      mjeseci: zaposlenik.prethodniMjeseci,
      dani: zaposlenik.prethodniDani,
    },
    {
      naslov: "Ukupan radni staž",
      godine: zaposlenik.ukupnoGodina,
      mjeseci: zaposlenik.ukupnoMjeseci,
      dani: zaposlenik.ukupnoDana,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold border-b pb-3 mb-6">
        💼 Radni odnos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kartice.map((k) => (
          <div
            key={k.naslov}
            className="border rounded-xl p-5 text-center"
          >
            <p className="text-gray-500 text-sm mb-3">
              {k.naslov}
            </p>

            <p className="text-3xl font-bold">
              {k.godine ?? 0}
            </p>

            <p className="text-gray-600 mt-2">
              {k.mjeseci ?? 0} mjeseci
            </p>

            <p className="text-gray-600">
              {k.dani ?? 0} dana
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RadniOdnos;