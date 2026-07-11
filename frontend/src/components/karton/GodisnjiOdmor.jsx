function GodisnjiOdmor({ zaposlenik }) {
  const ukupnoGO =
    (zaposlenik.godisnji || 0) +
    (zaposlenik.dodatniDani || 0);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold border-b pb-3 mb-6">
        🏖 Godišnji odmor
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

        <div className="border rounded-xl p-5 text-center">
          <p className="text-gray-500 text-sm">Osnovica
{zaposlenik.obracun?.osnovica ?? zaposlenik.godisnji}
          </p>
          <p className="text-sm text-gray-500 mt-2">dana</p>
        </div>

        <div className="border rounded-xl p-5 text-center">
          <p className="text-gray-500 text-sm">Dodatni dani</p>
          <p className="text-3xl font-bold mt-3">
            {zaposlenik.dodatniDani || 0}
          </p>
          <p className="text-sm text-gray-500 mt-2">dana</p>
        </div>

        <div className="border rounded-xl p-5 text-center">
          <p className="text-gray-500 text-sm">Ukupno po pravilniku
{zaposlenik.obracun?.ukupno ?? ukupnoGO}
          </p>
          <p className="text-sm text-gray-500 mt-2">dana</p>
        </div>

        <div className="border rounded-xl p-5 text-center">
          <p className="text-gray-500 text-sm">Iskorišteno</p>
          <p className="text-3xl font-bold mt-3">
            {zaposlenik.iskoristeno}
          </p>
          <p className="text-sm text-gray-500 mt-2">dana</p>
        </div>

        <div className="border rounded-xl p-5 text-center">
          <p className="text-gray-500 text-sm">Preostalo</p>
          <p className="text-3xl font-bold text-green-600 mt-3">
            {zaposlenik.preostalo}
          </p>
          <p className="text-sm text-gray-500 mt-2">dana</p>
        </div>

      </div>
    </div>
  );
}

export default GodisnjiOdmor;