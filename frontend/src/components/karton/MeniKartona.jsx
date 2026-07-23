function MeniKartona({ aktivniTab, setAktivniTab }) {
const tabovi = [
  { id: "osnovni", naziv: "Osnovni podaci" },
  { id: "radni", naziv: "Radni odnos" },
  { id: "go", naziv: "GO" },
{ id: "kriteriji", naziv: "Obračun GO" },
  { id: "historija", naziv: "Historija" },
  { id: "dokumenti", naziv: "Dokumenti" },
];

  return (
    <div className="bg-white rounded-xl shadow mb-6">
      <div className="flex gap-6 px-6 py-4 font-medium">
        {tabovi.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAktivniTab(tab.id)}
className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
  aktivniTab === tab.id
    ? "bg-blue-600 text-white shadow"
    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
}`}
          >
            {tab.naziv}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MeniKartona;