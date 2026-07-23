import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ZaglavljeKartona from "../components/karton/ZaglavljeKartona";
import MeniKartona from "../components/karton/MeniKartona";
import OsnovniPodaci from "../components/karton/OsnovniPodaci";
import StatistikaKartona from "../components/karton/StatistikaKartona";
import RadniOdnos from "../components/karton/RadniOdnos";
import GodisnjiOdmor from "../components/karton/GodisnjiOdmor";
import KriterijiGO from "../components/karton/KriterijiGO";
import HistorijaOdsustava from "../components/karton/HistorijaOdsustava";
import DokumentiZaposlenika from "../components/karton/DokumentiZaposlenika";

function KartonZaposlenika() {
  const { id } = useParams();

  const [zaposlenik, setZaposlenik] = useState(null);
  const [aktivniTab, setAktivniTab] = useState("osnovni");

  const API_URL = import.meta.env.VITE_API_URL;

  const ucitajZaposlenika = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/zaposlenici/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setZaposlenik(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    ucitajZaposlenika();
  }, [id]);

  if (!zaposlenik) {
    return (
      <div className="p-8">
        Učitavanje...
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-100 min-h-screen">

      <ZaglavljeKartona zaposlenik={zaposlenik} />

      <StatistikaKartona zaposlenik={zaposlenik} />

      <MeniKartona
        aktivniTab={aktivniTab}
        setAktivniTab={setAktivniTab}
      />

      {aktivniTab === "osnovni" && (
        <OsnovniPodaci zaposlenik={zaposlenik} />
      )}

      {aktivniTab === "radni" && (
        <RadniOdnos
          zaposlenik={zaposlenik}
          osvjeziKarton={ucitajZaposlenika}
        />
      )}

      {aktivniTab === "go" && (
        <GodisnjiOdmor zaposlenik={zaposlenik} />
      )}

      {aktivniTab === "kriteriji" && (
        <KriterijiGO
          zaposlenik={zaposlenik}
          setZaposlenik={setZaposlenik}
        />
      )}
      {aktivniTab === "historija" && (
  <HistorijaOdsustava
    zaposlenik={zaposlenik}
  />
)}
{aktivniTab === "dokumenti" && (
  <DokumentiZaposlenika
    zaposlenik={zaposlenik}
  />
)}

    </div>
  );
}

export default KartonZaposlenika;