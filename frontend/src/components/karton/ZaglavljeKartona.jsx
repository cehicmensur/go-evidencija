function ZaglavljeKartona({ zaposlenik }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h1 className="text-3xl font-bold">
        {zaposlenik?.ime}
      </h1>

      <p className="text-gray-600 mt-2">
        Karton zaposlenika
      </p>
    </div>
  );
}

export default ZaglavljeKartona;