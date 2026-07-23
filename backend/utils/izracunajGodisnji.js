const {
  izracunajUkupanStaz,
} = require("./staz");

function izracunajGodisnji(zaposlenik) {
  const staz = izracunajUkupanStaz(zaposlenik);

  const osnovica = 20;

  let dodatakStaz = 0;
  let dodatakDjeca = 0;
  let dodatakInvaliditet = 0;
  let dodatakARBiH = 0;
  let dodatakMjesto = 0;
  let dodatakOcjena = 0;

  // ==========================
  // STAŽ
  // ==========================

  const ukupnoGodina = staz.ukupnoGodina;

  if (ukupnoGodina >= 20) dodatakStaz = 10;
  else if (ukupnoGodina >= 15) dodatakStaz = 8;
  else if (ukupnoGodina >= 10) dodatakStaz = 6;
  else if (ukupnoGodina >= 5) dodatakStaz = 4;
  else if (ukupnoGodina >= 3) dodatakStaz = 2;

  // ==========================
  // DJECA
  // ==========================

  const djeca = zaposlenik.brojDjeceU15 || 0;

  if (zaposlenik.samohraniRoditelj) {
    if (djeca >= 3) dodatakDjeca = 4;
    else if (djeca === 2) dodatakDjeca = 3;
    else if (djeca === 1) dodatakDjeca = 2;
  } else {
    if (djeca >= 3) dodatakDjeca = 3;
    else if (djeca === 2) dodatakDjeca = 2;
    else if (djeca === 1) dodatakDjeca = 1;
  }

  // ==========================
  // INVALIDITET
  // ==========================

  if (zaposlenik.invaliditet) {
    dodatakInvaliditet = 2;
  }

  // ==========================
  // ARBiH
  // ==========================

  const mjeseci = zaposlenik.mjeseciARBiH || 0;

  if (mjeseci >= 30) dodatakARBiH = 3;
  else if (mjeseci >= 18) dodatakARBiH = 2;
  else if (mjeseci >= 12) dodatakARBiH = 1;

  // ==========================
  // SLUŽBENIČKO MJESTO
  // ==========================

  switch (zaposlenik.nivoSluzbenickogMjesta) {
    case "Stručni saradnik":
      dodatakMjesto = 1;
      break;

    case "Viši stručni saradnik":
      dodatakMjesto = 2;
      break;

    case "Stručni savjetnik":
      dodatakMjesto = 3;
      break;

    case "Voditelj / šef":
      dodatakMjesto = 4;
      break;

    case "Rukovodeći službenik":
      dodatakMjesto = 5;
      break;
  }

  // ==========================
  // OCJENA
  // ==========================

  switch (zaposlenik.ocjenaRezultata) {
    case "Uspješan":
      dodatakOcjena = 1;
      break;

    case "Naročito uspješan":
      dodatakOcjena = 2;
      break;

    case "Izuzetan doprinos":
      dodatakOcjena = 3;
      break;
  }

  let ukupno =
    osnovica +
    dodatakStaz +
    dodatakDjeca +
    dodatakInvaliditet +
    dodatakARBiH +
    dodatakMjesto +
    dodatakOcjena;

  if (ukupno > 35) {
    ukupno = 35;
  }

  return {
    ...staz,

    osnovica,
    dodatakStaz,
    dodatakDjeca,
    dodatakInvaliditet,
    dodatakARBiH,
    dodatakMjesto,
    dodatakOcjena,

    ukupno,
  };
}

module.exports = izracunajGodisnji;