function StatistikaKartona({ zaposlenik }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500 text-sm">Ukupan staž</p>
        <p className="text-3xl font-bold mt-2">
          {zaposlenik.ukupnoGodina ?? 0} g
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500 text-sm">Godišnji odmor</p>
        <p className="text-3xl font-bold mt-2">
          {zaposlenik.godisnji + (zaposlenik.dodatniDani || 0)}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500 text-sm">Iskorišteno</p>
        <p className="text-3xl font-bold mt-2">
          {zaposlenik.iskoristeno ?? 0}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-500 text-sm">Preostalo</p>
        <p className="text-3xl font-bold mt-2">
          {zaposlenik.preostalo ?? 0}
        </p>
      </div>

    </div>
  );
}

export default StatistikaKartona;