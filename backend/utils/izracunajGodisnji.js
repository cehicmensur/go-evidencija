function izracunajGodisnji(zaposlenik) {
  let osnovica = 20;

  let dodatakStaz = 0;

  if (zaposlenik.ukupnoGodina >= 20) {
    dodatakStaz = 10;
  } else if (zaposlenik.ukupnoGodina >= 15) {
    dodatakStaz = 8;
  } else if (zaposlenik.ukupnoGodina >= 10) {
    dodatakStaz = 6;
  } else if (zaposlenik.ukupnoGodina >= 5) {
    dodatakStaz = 4;
  } else if (zaposlenik.ukupnoGodina >= 3) {
    dodatakStaz = 2;
  }

  return {
    osnovica,
    dodatakStaz,
    ukupno: osnovica + dodatakStaz,
  };
}

module.exports = izracunajGodisnji;