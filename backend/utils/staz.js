function izracunajUkupanStaz(zaposlenik) {
  // ==========================
  // Staž u MIZ
  // ==========================

  let godineUMIZ = 0;
  let mjeseciUMIZ = 0;
  let daniUMIZ = 0;

  if (zaposlenik.datumPocetka) {
    const danas = new Date();
    const pocetak = new Date(zaposlenik.datumPocetka);

    godineUMIZ =
      danas.getFullYear() -
      pocetak.getFullYear();

    mjeseciUMIZ =
      danas.getMonth() -
      pocetak.getMonth();

    daniUMIZ =
      danas.getDate() -
      pocetak.getDate();

    if (daniUMIZ < 0) {
      mjeseciUMIZ--;

      const zadnjiDan = new Date(
        danas.getFullYear(),
        danas.getMonth(),
        0
      ).getDate();

      daniUMIZ += zadnjiDan;
    }

    if (mjeseciUMIZ < 0) {
      godineUMIZ--;
      mjeseciUMIZ += 12;
    }
  }

  // ==========================
  // Prethodni staž
  // ==========================

  let prethodniGodina = 0;
  let prethodniMjeseci = 0;
  let prethodniDani = 0;

  const radniStazovi =
    zaposlenik.radniStazovi || [];

  for (const s of radniStazovi) {
    const od = new Date(s.datumOd);
    const doDatum = new Date(s.datumDo);

    let godine =
      doDatum.getFullYear() -
      od.getFullYear();

    let mjeseci =
      doDatum.getMonth() -
      od.getMonth();

    let dani =
      doDatum.getDate() -
      od.getDate();

    if (dani < 0) {
      mjeseci--;

      const zadnjiDan = new Date(
        doDatum.getFullYear(),
        doDatum.getMonth(),
        0
      ).getDate();

      dani += zadnjiDan;
    }

    if (mjeseci < 0) {
      godine--;
      mjeseci += 12;
    }

    s.godine = godine;
    s.mjeseci = mjeseci;
    s.dani = dani;
    s.trajanje =
      `${godine} g ${mjeseci} mj ${dani} d`;

    prethodniGodina += godine;
    prethodniMjeseci += mjeseci;
    prethodniDani += dani;
  }

  while (prethodniDani >= 30) {
    prethodniDani -= 30;
    prethodniMjeseci++;
  }

  while (prethodniMjeseci >= 12) {
    prethodniMjeseci -= 12;
    prethodniGodina++;
  }

  // ==========================
  // Ukupan staž
  // ==========================

  let ukupnoGodina =
    godineUMIZ + prethodniGodina;

  let ukupnoMjeseci =
    mjeseciUMIZ + prethodniMjeseci;

  let ukupnoDana =
    daniUMIZ + prethodniDani;

  while (ukupnoDana >= 30) {
    ukupnoDana -= 30;
    ukupnoMjeseci++;
  }

  while (ukupnoMjeseci >= 12) {
    ukupnoMjeseci -= 12;
    ukupnoGodina++;
  }

  return {
    godineUMIZ,
    mjeseciUMIZ,
    daniUMIZ,

    prethodniGodina,
    prethodniMjeseci,
    prethodniDani,

    ukupnoGodina,
    ukupnoMjeseci,
    ukupnoDana,

    radniStazovi,
  };
}

module.exports = {
  izracunajUkupanStaz,
};