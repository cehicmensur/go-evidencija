function formatDatum(datum) {
  if (!datum) return "-";

  return new Date(datum).toLocaleDateString("bs-BA");
}

function OsnovniPodaci({ zaposlenik }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold border-b pb-3 mb-6">
        Osnovni podaci
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">

        <div>
          <p className="text-sm text-gray-500">ID</p>
          <p className="font-semibold">{zaposlenik.id}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Ime i prezime</p>
          <p className="font-semibold">{zaposlenik.ime}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Pozicija</p>
          <p className="font-semibold">{zaposlenik.pozicija}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Datum zaposlenja</p>
          <p className="font-semibold">
            {formatDatum(zaposlenik.datumPocetka)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-semibold text-green-600">
            Aktivan
          </p>
        </div>

      </div>
    </div>
  );
}

export default OsnovniPodaci;