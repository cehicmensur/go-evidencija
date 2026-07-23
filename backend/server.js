require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const { createClient } = require("@supabase/supabase-js");
const multer = require("multer");
const {
  izracunajUkupanStaz,
} = require("./utils/staz");

const izracunajGodisnji =
  require("./utils/izracunajGodisnji");

const prisma = new PrismaClient();
const supabase = createClient(

  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const upload = multer({
  storage: multer.memoryStorage(),
});

(async () => {
  try {
    await prisma.$connect();
    console.log("✅ Prisma CONNECT OK");
  } catch (err) {
    console.error("❌ Prisma CONNECT ERROR");
    console.error(err);
  }
})();
const app = express();
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

const resend = new Resend(process.env.RESEND_API_KEY);

console.log("RESEND KEY:", process.env.RESEND_API_KEY?.substring(0, 10));

const ADMIN_EMAIL = "cehicmensur@gmail.com";

app.use(cors());
app.use(express.json());

const JWT_SECRET = "super_tajni_kljuc";

function provjeriToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Nema tokena." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.korisnik = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Neispravan token." });
  }
}

function samoAdmin(req, res, next) {
  if (req.korisnik.uloga !== "admin") {
    return res.status(403).json({ error: "Samo admin ima pristup." });
  }

  next();
}


function izracunajGodisnjiPoPravilniku(zaposlenik) {
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

let godineUMIZ = 0;

if (zaposlenik.datumPocetka) {
  const danas = new Date();
  const pocetak = new Date(zaposlenik.datumPocetka);

  godineUMIZ =
    danas.getFullYear() -
    pocetak.getFullYear();

  const mjesec =
    danas.getMonth() -
    pocetak.getMonth();

  if (
    mjesec < 0 ||
    (mjesec === 0 &&
      danas.getDate() < pocetak.getDate())
  ) {
    godineUMIZ--;
  }
}

let prethodniGodina = 0;
let prethodniMjeseci = 0;
let prethodniDani = 0;

if (zaposlenik.radniStazovi?.length) {

  for (const s of zaposlenik.radniStazovi) {

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
}

const ukupnoGodina =
  zaposlenik.ukupnoGodina ??
  (godineUMIZ + prethodniGodina);

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

  if (zaposlenik.invaliditet)
    dodatakInvaliditet = 2;

  // ==========================
  // ARBiH
  // ==========================

  const mjeseci =
    zaposlenik.mjeseciARBiH || 0;

  if (mjeseci >= 30)
    dodatakARBiH = 3;
  else if (mjeseci >= 18)
    dodatakARBiH = 2;
  else if (mjeseci >= 12)
    dodatakARBiH = 1;

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

  if (ukupno > 35)
    ukupno = 35;

  return {
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

function brojDana(od, doDatuma, praznici) {
  const start = new Date(od);
  const end = new Date(doDatuma);

  let broj = 0;

  const trenutni = new Date(start);

  while (trenutni <= end) {
    const danUSedmici = trenutni.getDay();

    const datumString =
      trenutni.toISOString().split("T")[0];

    const vikend =
      danUSedmici === 0 ||
      danUSedmici === 6;

    const praznik =
      praznici.includes(datumString);

    if (!vikend && !praznik) {
      broj++;
    }

    trenutni.setDate(
      trenutni.getDate() + 1
    );
  }

  return broj;
}
function izracunajPeriod(datumOd, datumDo) {
  const od = new Date(datumOd);
  const doDatum = new Date(datumDo);

  let godine = doDatum.getFullYear() - od.getFullYear();
  let mjeseci = doDatum.getMonth() - od.getMonth();
  let dani = doDatum.getDate() - od.getDate();

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

  return {
    godine,
    mjeseci,
    dani,
  };
}
function saberiTrajanje(lista) {
  let godine = 0;
  let mjeseci = 0;
  let dani = 0;

  for (const stavka of lista) {
    godine += stavka.godine;
    mjeseci += stavka.mjeseci;
    dani += stavka.dani;
  }

  while (dani >= 30) {
    dani -= 30;
    mjeseci++;
  }

  while (mjeseci >= 12) {
    mjeseci -= 12;
    godine++;
  }

  return {
    godine,
    mjeseci,
    dani,
  };
}

app.get("/zaposlenici-javno", async (req, res) => {
  try {
    const zaposlenici = await prisma.zaposlenik.findMany({
      select: {
        id: true,
        ime: true,
      },
    });

    zaposlenici.sort((a, b) => {
      const prezimeA = a.ime.trim().split(" ").pop();
      const prezimeB = b.ime.trim().split(" ").pop();

      const rezultat = prezimeA.localeCompare(prezimeB, "bs");

      if (rezultat !== 0) return rezultat;

      return a.ime.localeCompare(b.ime, "bs");
    });

    res.json(zaposlenici);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Greška kod učitavanja zaposlenika.",
    });
  }
});

/* JAVNA REGISTRACIJA */
app.post("/register", async (req, res) => {
  try {
    const { email, lozinka, zaposlenikId } = req.body;

    const zaposlenik = await prisma.zaposlenik.findUnique({
      where: {
        id: Number(zaposlenikId),
      },
    });
    
    const postoji = await prisma.korisnik.findUnique({
  where: {
    email,
  },
});

    if (postoji) {
      return res.status(400).json({ error: "Korisnik već postoji" });
    }

    const hashovanaLozinka = await bcrypt.hash(lozinka, 10);

await prisma.korisnik.create({
  data: {
    ime: zaposlenik?.ime || email,
    email,
    lozinka: hashovanaLozinka,
    uloga: "zaposlenik",
    odobren: false,
    zaposlenikId: Number(zaposlenikId),
  },
});

    res.json({
      message:
        "Registracija zaprimljena. Sačekajte da administrator odobri pristup.",
    });
} catch (error) {
  console.error("GRESKA /zaposlenici:");
  console.error(error);

  res.status(500).json({
    error: error.message,
  });
}
});
/* LOGIN */
app.post("/login", async (req, res) => {
  try {
    const { email, lozinka } = req.body;

    const korisnik = await prisma.korisnik.findUnique({
      where: { email },
    });
    if (!korisnik) {
      return res.status(400).json({ error: "Korisnik ne postoji" });
    }

    const validnaLozinka = await bcrypt.compare(lozinka, korisnik.lozinka);

    if (!validnaLozinka) {
      return res.status(400).json({ error: "Pogrešna lozinka" });
    }

    if (!korisnik.odobren) {
      return res.status(403).json({
        error: "Vaš korisnički nalog još nije odobren od administratora.",
      });
    }

    const token = jwt.sign(
      {
        id: korisnik.id,
        email: korisnik.email,
        uloga: korisnik.uloga,
        zaposlenikId: korisnik.zaposlenikId,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      korisnik,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod logina" });
  }
});

/* KORISNICI — ADMIN */
app.get("/admin/korisnici", provjeriToken, samoAdmin, async (req, res) => {
  try {
    const korisnici = await prisma.korisnik.findMany({
      orderBy: { ime: "asc" },
      include: {
        zaposlenik: true,
      },
    });

    res.json(korisnici);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod učitavanja korisnika" });
  }
});

app.post("/admin/korisnici", provjeriToken, samoAdmin, async (req, res) => {
  try {
    const { ime, email, lozinka, uloga, zaposlenikId, odobren } = req.body;

    const postoji = await prisma.korisnik.findUnique({
      where: { email },
    });

    if (postoji) {
      return res.status(400).json({ error: "Korisnik već postoji" });
    }

    const hashovanaLozinka = await bcrypt.hash(lozinka, 10);

    const korisnik = await prisma.korisnik.create({
      data: {
        ime,
        email,
        lozinka: hashovanaLozinka,
        uloga: uloga === "admin" ? "admin" : "zaposlenik",
        odobren: odobren === false ? false : true,
        zaposlenikId: zaposlenikId ? Number(zaposlenikId) : null,
      },
    });

    res.json({
      message: "Korisnik kreiran",
      korisnik,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod kreiranja korisnika" });
  }
});

app.put("/admin/korisnici/:id", provjeriToken, samoAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { uloga, odobren, zaposlenikId } = req.body;

    const korisnik = await prisma.korisnik.update({
      where: { id: Number(id) },
      data: {
        ...(uloga ? { uloga } : {}),
        ...(typeof odobren === "boolean" ? { odobren } : {}),
        ...(zaposlenikId !== undefined
          ? { zaposlenikId: zaposlenikId ? Number(zaposlenikId) : null }
          : {}),
      },
    });

    res.json(korisnik);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod izmjene korisnika" });
  }
});

/* RESET LOZINKE — ADMIN */
app.put(
  "/admin/reset-lozinka/:id",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { novaLozinka } = req.body;

      if (!novaLozinka || novaLozinka.length < 6) {
        return res.status(400).json({
          error: "Nova lozinka mora imati najmanje 6 karaktera.",
        });
      }

      const hashovanaLozinka = await bcrypt.hash(novaLozinka, 10);

      await prisma.korisnik.update({
        where: { id: Number(id) },
        data: {
          lozinka: hashovanaLozinka,
        },
      });

      res.json({
        message: "Lozinka je uspješno resetovana.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Greška kod resetovanja lozinke",
      });
    }
  }
);

app.delete(
  "/admin/korisnici/:id",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

if (Number(id) === Number(req.korisnik.id)) {
  return res.status(400).json({
    error: "Ne možete obrisati vlastiti admin nalog.",
  });
}

      await prisma.korisnik.delete({
        where: { id: Number(id) },
      });

      res.json({ message: "Korisnik obrisan" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Greška kod brisanja korisnika" });
    }
  }
);

/* ZAPOSLENICI */
app.get(
  "/zaposlenici",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const zaposlenici = await prisma.zaposlenik.findMany({
        include: {
          odmori: true,
          radniStazovi: true,
        },
      });

      const neradniDani = await prisma.neradniDan.findMany();

      const praznici = neradniDani.map((d) =>
        new Date(d.datum).toISOString().split("T")[0]
      );

      zaposlenici.sort((a, b) => {
        const prezimeA = a.ime.trim().split(" ").pop();
        const prezimeB = b.ime.trim().split(" ").pop();

        return prezimeA.localeCompare(prezimeB, "bs");
      });

      const rezultat = await Promise.all(
        zaposlenici.map(async (z) => {
          let iskoristeno = 0;

          // Prethodni staž
          let prethodniGodina = 0;
          let prethodniMjeseci = 0;
          let prethodniDani = 0;

          for (const s of z.radniStazovi) {
            const od = new Date(s.datumOd);
            const doDatum = new Date(s.datumDo);

            let godine =
              doDatum.getFullYear() - od.getFullYear();
            let mjeseci =
              doDatum.getMonth() - od.getMonth();
            let dani =
              doDatum.getDate() - od.getDate();

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

            prethodniGodina += godine;
            prethodniMjeseci += mjeseci;
            prethodniDani += dani;
          }

          // Iskorišteni godišnji
          for (const o of z.odmori) {
            if (
              o.status === "odobreno" &&
              o.odbijaSeOdGodisnjeg
            ) {
              iskoristeno += await brojDana(
                o.od,
                o.do,
                praznici
              );
            }
          }

          // Staž u MIZ
          let godineUMIZ = 0;
          let mjeseciUMIZ = 0;
          let daniUMIZ = 0;

          if (z.datumPocetka) {
            const danas = new Date();
            const pocetak = new Date(z.datumPocetka);

            let godine =
              danas.getFullYear() -
              pocetak.getFullYear();

            let mjeseci =
              danas.getMonth() -
              pocetak.getMonth();

            let dani =
              danas.getDate() -
              pocetak.getDate();

            if (dani < 0) {
              mjeseci--;

              const zadnjiDanProslogMjeseca = new Date(
                danas.getFullYear(),
                danas.getMonth(),
                0
              ).getDate();

              dani += zadnjiDanProslogMjeseca;
            }

            if (mjeseci < 0) {
              godine--;
              mjeseci += 12;
            }

            godineUMIZ = godine;
            mjeseciUMIZ = mjeseci;
            daniUMIZ = dani;
          }

          // Ukupan staž
          let ukupnoGodina =
            prethodniGodina + godineUMIZ;

          let ukupnoMjeseci =
            prethodniMjeseci + mjeseciUMIZ;

          let ukupnoDana =
            prethodniDani + daniUMIZ;

          while (ukupnoDana >= 30) {
            ukupnoDana -= 30;
            ukupnoMjeseci++;
          }

          while (ukupnoMjeseci >= 12) {
            ukupnoMjeseci -= 12;
            ukupnoGodina++;
          }

          if (ukupnoMjeseci >= 12) {
            ukupnoGodina += Math.floor(
              ukupnoMjeseci / 12
            );
            ukupnoMjeseci =
              ukupnoMjeseci % 12;
          }
const staz = izracunajUkupanStaz(z);
const obracun = izracunajGodisnji(z);

console.log("\n==============================");
console.log("LISTING:", z.ime);
console.log("STAŽ:", staz);
console.log("OBRAČUN GO:", obracun);
console.log("==============================\n");

const ukupnoGO = obracun.ukupno;

return {
  ...z,

  obracun,

  ukupnoGodina: staz.ukupnoGodina,
  ukupnoMjeseci: staz.ukupnoMjeseci,
  ukupnoDana: staz.ukupnoDana,

  iskoristeno,
  preostalo: ukupnoGO - iskoristeno,
  ukupnoGO,
};

        })   // zatvara zaposlenici.map(...)
      );      // zatvara Promise.all(...)

      res.json(rezultat);

    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Greška kod učitavanja zaposlenika",
      });
    }
  }
);
app.get(
  "/zaposlenici/:id",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const godina = new Date().getFullYear();

const obracunGO = await prisma.obracunGO.findFirst({
  where: {
    zaposlenikId: id,
    godina,
  },
});

      const zaposlenik = await prisma.zaposlenik.findUnique({
        where: { id },
        include: {
          odmori: true,
          radniStazovi: true,
        },
      });

      if (!zaposlenik) {
        return res.status(404).json({
          error: "Zaposlenik nije pronađen",
        });
      }

      const neradniDani =
        await prisma.neradniDan.findMany();

      const praznici = neradniDani.map((d) =>
        new Date(d.datum).toISOString().split("T")[0]
      );

      let iskoristeno = 0;

      // Prethodni staž
      let prethodniGodina = 0;
      let prethodniMjeseci = 0;
      let prethodniDani = 0;

for (const s of zaposlenik.radniStazovi) {
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

  // ← DODAJ OVO
  s.godine = godine;
  s.mjeseci = mjeseci;
  s.dani = dani;
  s.trajanje =
    `${godine} g ${mjeseci} mj ${dani} d`;

  prethodniGodina += godine;
  prethodniMjeseci += mjeseci;
  prethodniDani += dani;
}

      // Iskorišteni godišnji
      for (const o of zaposlenik.odmori) {
        if (
          o.status === "odobreno" &&
          o.odbijaSeOdGodisnjeg
        ) {
          iskoristeno += await brojDana(
            o.od,
            o.do,
            praznici
          );
        }
      }

      // Staž u MIZ
      let godineUMIZ = 0;
      let mjeseciUMIZ = 0;
      let daniUMIZ = 0;

      if (zaposlenik.datumPocetka) {
        const danas = new Date();
        const pocetak = new Date(
          zaposlenik.datumPocetka
        );

        let godine =
          danas.getFullYear() -
          pocetak.getFullYear();

        let mjeseci =
          danas.getMonth() -
          pocetak.getMonth();

        let dani =
          danas.getDate() -
          pocetak.getDate();

        if (dani < 0) {
          mjeseci--;

          const zadnjiDanProslogMjeseca =
            new Date(
              danas.getFullYear(),
              danas.getMonth(),
              0
            ).getDate();

          dani += zadnjiDanProslogMjeseca;
        }

        if (mjeseci < 0) {
          godine--;
          mjeseci += 12;
        }

        godineUMIZ = godine;
        mjeseciUMIZ = mjeseci;
        daniUMIZ = dani;
      }

      // Ukupan staž
      let ukupnoGodina =
        prethodniGodina + godineUMIZ;

      let ukupnoMjeseci =
        prethodniMjeseci + mjeseciUMIZ;

      let ukupnoDana =
        prethodniDani + daniUMIZ;

      while (ukupnoDana >= 30) {
        ukupnoDana -= 30;
        ukupnoMjeseci++;
      }

      while (ukupnoMjeseci >= 12) {
        ukupnoMjeseci -= 12;
        ukupnoGodina++;
      }

const obracun = izracunajGodisnji(zaposlenik);

const staz = izracunajUkupanStaz(zaposlenik);

console.log("=== KARTON ===");
console.log(zaposlenik.ime);
console.log("STAŽ:", staz);
console.log("GO:", obracun);

const ukupnoGO =
  obracun.ukupno;
for (const o of zaposlenik.odmori) {
  o.brojDana = await brojDana(
    o.od,
    o.do,
    praznici
  );
}
console.log("ODMORI:", zaposlenik.odmori);

      res.json({
        ...zaposlenik,

prethodniGodina: staz.prethodniGodina,
prethodniMjeseci: staz.prethodniMjeseci,
prethodniDani: staz.prethodniDani,

godineUMIZ: staz.godineUMIZ,
mjeseciUMIZ: staz.mjeseciUMIZ,
daniUMIZ: staz.daniUMIZ,

ukupnoGodina: staz.ukupnoGodina,
ukupnoMjeseci: staz.ukupnoMjeseci,
ukupnoDana: staz.ukupnoDana,

        obracun,

        obracunGO,

        iskoristeno,
        preostalo: ukupnoGO - iskoristeno,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Greška kod učitavanja kartona zaposlenika",
      });
    }
  }
);
app.get(
  "/zaposlenici/:id/obracuni",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const obracuni =
        await prisma.obracunGO.findMany({
          where: {
            zaposlenikId: id,
          },
          orderBy: {
            godina: "desc",
          },
        });

      res.json(obracuni);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška kod učitavanja obračuna.",
      });
    }
  }
);
app.post("/zaposlenici", provjeriToken, samoAdmin, async (req, res) => {
  try {
    const {
      ime,
      pozicija,
      datumPocetka,
      prethodniStazGodina,
      prethodniStazMjeseci,
      dodatniDani,
    } = req.body;

const stari = await prisma.zaposlenik.findUnique({
  where: {
    id: Number(id),
  },
  include: {
    radniStazovi: true,
  },
});

const prethodni = stari.radniStazovi.reduce(
  (ukupno, s) => {
    const od = new Date(s.datumOd);
    const doDatum = new Date(s.datumDo);

    let godine =
      doDatum.getFullYear() - od.getFullYear();

    if (
      doDatum.getMonth() < od.getMonth() ||
      (doDatum.getMonth() === od.getMonth() &&
        doDatum.getDate() < od.getDate())
    ) {
      godine--;
    }

    return ukupno + godine;
  },
  0
);

const godineUMIZ = izracunajGodisnji(
  datumPocetka,
  0,
  0
);

const godisnji =
  izracunajGodisnjiPoPravilniku({
    datumPocetka,
    ukupnoGodina:
      prethodni +
      (godineUMIZ - 20),
    brojDjeceU15:
      Number(brojDjeceU15) || 0,
    invaliditet:
      Boolean(invaliditet),
    mjeseciARBiH:
      Number(mjeseciARBiH) || 0,
    nivoSluzbenickogMjesta,
    ocjenaRezultata,
    samohraniRoditelj:
      Boolean(samohraniRoditelj),
  }).ukupno;

    const novi = await prisma.zaposlenik.create({
      data: {
        ime,
        pozicija,
        datumPocetka: new Date(datumPocetka),
        godisnji,
        prethodniStazGodina:
          Number(prethodniStazGodina) || 0,
        prethodniStazMjeseci:
          Number(prethodniStazMjeseci) || 0,
        dodatniDani:
          Number(dodatniDani) || 0,
      },
    });

    res.json(novi);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Greška kod dodavanja zaposlenika",
    });
  }
});

app.put(
  "/zaposlenici/:id",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

const {
  ime,
  pozicija,
  datumPocetka,
  prethodniStazGodina,
  prethodniStazMjeseci,
  dodatniDani,

  brojDjeceU15,
  invaliditet,
  mjeseciARBiH,
  nivoSluzbenickogMjesta,
  ocjenaRezultata,
  samohraniRoditelj,
} = req.body;

      const godisnji = izracunajGodisnji(
        datumPocetka,
        prethodniStazGodina,
        prethodniStazMjeseci
      );

      const update = await prisma.zaposlenik.update({
        where: {
          id: Number(id),
        },
        data: {
          ime,
          pozicija,

          datumPocetka: new Date(datumPocetka),

          prethodniStazGodina:
            Number(prethodniStazGodina) || 0,

          prethodniStazMjeseci:
            Number(prethodniStazMjeseci) || 0,

          dodatniDani:
            Number(dodatniDani) || 0,

            brojDjeceU15:
  Number(brojDjeceU15) || 0,

invaliditet:
  Boolean(invaliditet),

mjeseciARBiH:
  Number(mjeseciARBiH) || 0,

nivoSluzbenickogMjesta,

ocjenaRezultata,

samohraniRoditelj:
  Boolean(samohraniRoditelj),

          godisnji,
        },
      });

      res.json(update);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Greška kod izmjene zaposlenika",
      });
    }
  }
);

app.put(
  "/zaposlenici/:id/kriteriji",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        brojDjeceU15,
        samohraniRoditelj,
        invaliditet,
        mjeseciARBiH,
        nivoSluzbenickogMjesta,
        ocjenaRezultata,
      } = req.body;

const stari = await prisma.zaposlenik.findUnique({
  where: {
    id: Number(id),
  },
});

const podaci = {
  ...stari,
  brojDjeceU15: Number(brojDjeceU15 || 0),
  samohraniRoditelj: Boolean(samohraniRoditelj),
  invaliditet: Boolean(invaliditet),
  mjeseciARBiH: Number(mjeseciARBiH || 0),
  nivoSluzbenickogMjesta:
    nivoSluzbenickogMjesta || "ostalo",
  ocjenaRezultata:
    ocjenaRezultata || "bez",
};

const obracun = izracunajGodisnjiPoPravilniku(podaci);

const zaposlenik = await prisma.zaposlenik.update({
  where: {
    id: Number(id),
  },
  data: {
    brojDjeceU15: podaci.brojDjeceU15,
    samohraniRoditelj: podaci.samohraniRoditelj,
    invaliditet: podaci.invaliditet,
    mjeseciARBiH: podaci.mjeseciARBiH,
    nivoSluzbenickogMjesta: podaci.nivoSluzbenickogMjesta,
    ocjenaRezultata: podaci.ocjenaRezultata,
    godisnji: obracun.ukupno,
  },
});

      res.json(zaposlenik);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        greska: "Greška prilikom spremanja kriterija GO.",
      });
    }
  }
);

app.delete("/zaposlenici/:id", provjeriToken, samoAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const zaposlenikId = Number(id);

    await prisma.godisnjiOdmor.deleteMany({
      where: {
        zaposlenikId,
      },
    });

    await prisma.korisnik.deleteMany({
      where: {
        zaposlenikId,
      },
    });

    await prisma.zaposlenik.delete({
      where: {
        id: zaposlenikId,
      },
    });

    res.json({
      message: "Zaposlenik obrisan",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Greška kod brisanja zaposlenika",
    });
  }
});

/* ODSUSTVA */
app.get("/godisnji", provjeriToken, async (req, res) => {
  try {
    const gdje =
      req.korisnik.uloga === "admin"
        ? {}
        : { zaposlenikId: Number(req.korisnik.zaposlenikId) };

    const zahtjevi = await prisma.godisnjiOdmor.findMany({
      where: gdje,
      include: { zaposlenik: true },
      orderBy: { id: "desc" },
    });

    res.json(zahtjevi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod učitavanja odsustava" });
  }
});

app.post("/godisnji", provjeriToken, async (req, res) => {
  try {
    const { zaposlenikId, vrsta, od, do: doDatuma, napomena } = req.body;

    const finalZaposlenikId =
      req.korisnik.uloga === "admin"
        ? Number(zaposlenikId)
        : Number(req.korisnik.zaposlenikId);

    if (!finalZaposlenikId) {

  return res.status(400).json({
    error: "Korisnik nije povezan sa zaposlenikom.",
  });
}

    const finalVrsta = vrsta || "Godišnji odmor";

    const novi = await prisma.godisnjiOdmor.create({
      data: {
        zaposlenikId: finalZaposlenikId,
        vrsta: finalVrsta,
        od: new Date(od),
        do: new Date(doDatuma),
        status: "na čekanju",
        napomena: napomena || null,
        odbijaSeOdGodisnjeg: finalVrsta === "Godišnji odmor",
      },
    });

const zaposlenik = await prisma.zaposlenik.findUnique({
  where: {
    id: finalZaposlenikId,
  },
});

await resend.emails.send({
  from: "noreply@mizbihac.ba",
  to: ADMIN_EMAIL,
  subject: "GO Evidencija - Novi zahtjev",
  html: `
    <h2>Novi zahtjev za odsustvo</h2>

    <p><strong>Zaposlenik:</strong> ${zaposlenik?.ime}</p>
    <p><strong>Vrsta:</strong> ${finalVrsta}</p>
    <p><strong>Od:</strong> ${od}</p>
    <p><strong>Do:</strong> ${doDatuma}</p>

    <p>Prijavite se u GO Evidenciju radi obrade zahtjeva.</p>
  `,
});

    res.json(novi);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Greška kod dodavanja odsustva",
    });
  }
});

app.put("/godisnji/:id", provjeriToken, samoAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const zahtjev = await prisma.godisnjiOdmor.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        zaposlenik: true,
      },
    });

    const korisnik = await prisma.korisnik.findFirst({
      where: {
        zaposlenikId: zahtjev.zaposlenikId,
      },
    });

if (korisnik?.email) {
  const rezultat = await resend.emails.send({
    from: "noreply@mizbihac.ba",
    to: korisnik.email,
    subject: `GO Evidencija - Zahtjev ${status}`,
    html: `
      <h2>Status zahtjeva promijenjen</h2>

      <p>Poštovani/a ${zahtjev.zaposlenik?.ime},</p>

      <p>Vaš zahtjev za odsustvo je <strong>${status}</strong>.</p>
    `,
  });

}

    res.json(zahtjev);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod izmjene statusa" });
  }
});

app.delete("/godisnji/:id", provjeriToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.godisnjiOdmor.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Odsustvo obrisano" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod brisanja odsustva" });
  }
});
/* NERADNI DANI */

app.get("/neradni-dani", provjeriToken, async (req, res) => {
try {
const dani = await prisma.neradniDan.findMany({
orderBy: {
datum: "asc",
},
});

res.json(dani);

} catch (error) {
console.error(error);
res.status(500).json({
error: "Greška kod učitavanja neradnih dana",
});
}
});

app.post("/neradni-dani", provjeriToken, samoAdmin, async (req, res) => {
try {
const { naziv, datum } = req.body;

const noviDan = await prisma.neradniDan.create({
  data: {
    naziv,
datum: datum ? new Date(datum) : new Date(),
  },
});

res.json(noviDan);
} catch (error) {
console.error(error);
res.status(500).json({
error: "Greška kod dodavanja neradnog dana",
});
}
});

app.delete(
  "/neradni-dani/:id",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.neradniDan.delete({
        where: {
          id: Number(id),
        },
      });

      res.json({
        message: "Neradni dan obrisan",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Greška kod brisanja neradnog dana",
      });
    }
  }
);
app.get("/test-email", async (req, res) => {
  try {
    const rezultat = await resend.emails.send({
from: "noreply@mizbihac.ba",     to: ADMIN_EMAIL,
      subject: "GO Evidencija - Test email",
      html: `
        <h2>Test email</h2>
        <p>Resend radi ispravno.</p>
      `,
    });

    res.json(rezultat);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});
app.get(
  "/radni-staz/:zaposlenikId",
  provjeriToken,
  async (req, res) => {
    try {
      const podaci =
        await prisma.radniStaz.findMany({
          where: {
            zaposlenikId: Number(
              req.params.zaposlenikId
            ),
          },
          orderBy: {
            datumOd: "asc",
          },
        });

      const rezultat = podaci.map((s) => {
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

          const zadnjiDan =
            new Date(
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

        return {
          ...s,
          godine,
          mjeseci,
          dani,
          trajanje:
            `${godine} g ` +
            `${mjeseci} mj ` +
            `${dani} d`,
        };
      });

      res.json(rezultat);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Greška kod učitavanja staža",
      });
    }
  }
);

app.post(
  "/radni-staz",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const {
        zaposlenikId,
        poslodavac,
        datumOd,
        datumDo,
      } = req.body;

      const novi =
        await prisma.radniStaz.create({
          data: {
            zaposlenikId:
              Number(zaposlenikId),

            poslodavac,

            datumOd: new Date(datumOd),

            datumDo: new Date(datumDo),
          },
        });

console.log("NOVI RADNI STAZ:", novi);

      res.json(novi);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška kod dodavanja staža",
      });
    }
  }
);
app.put(
  "/radni-staz/:id",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        poslodavac,
        datumOd,
        datumDo,
      } = req.body;

      const stavka =
        await prisma.radniStaz.update({
          where: {
            id: Number(id),
          },
          data: {
            poslodavac,
            datumOd: new Date(datumOd),
            datumDo: new Date(datumDo),
          },
        });

      res.json(stavka);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška kod izmjene radnog staža.",
      });
    }
  }
);
/* DOKUMENTI */

app.get(
  "/dokumenti/:zaposlenikId",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const zaposlenikId = Number(req.params.zaposlenikId);

      const dokumenti =
        await prisma.dokument.findMany({
          where: {
            zaposlenikId,
          },
          orderBy: {
            datum: "desc",
          },
        });

      res.json(dokumenti);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška kod učitavanja dokumenata.",
      });
    }
  }
);

app.get(
  "/dokumenti/:id/pregled",
  async (req, res) => {
    try {
      const dokument = await prisma.dokument.findUnique({
        where: {
          id: Number(req.params.id),
        },
      });

      if (!dokument) {
        return res.status(404).json({
          error: "Dokument nije pronađen.",
        });
      }

      const { data, error } =
        await supabase.storage
          .from("dokumenti")
          .createSignedUrl(
            dokument.datoteka,
            60
          );

      if (error) throw error;

      res.redirect(data.signedUrl);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška.",
      });
    }
  }
);

app.get(
  "/dokumenti/:id/download",
  async (req, res) => {
    try {
      const dokument = await prisma.dokument.findUnique({
        where: {
          id: Number(req.params.id),
        },
      });

      if (!dokument) {
        return res.status(404).json({
          error: "Dokument nije pronađen.",
        });
      }

      const { data, error } =
        await supabase.storage
          .from("dokumenti")
          .createSignedUrl(
            dokument.datoteka,
            60
          );

      if (error) throw error;

      res.redirect(data.signedUrl);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška.",
      });
    }
  }
);

app.post(
  "/dokumenti",
  provjeriToken,
  samoAdmin,
  upload.single("datoteka"),
  async (req, res) => {


    try {
      const {
        zaposlenikId,
        naziv,
        vrsta,
        opis,
        datum,
      } = req.body;

      if (!req.file) {
        return res.status(400).json({
          error: "Nije odabrana datoteka.",
        });
      }

      const nazivDatoteke =
        `${zaposlenikId}/${Date.now()}_${req.file.originalname}`;

      const { error } = await supabase.storage
        .from("dokumenti")
        .upload(nazivDatoteke, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) throw error;

      const dokument =
        await prisma.dokument.create({
          data: {
            zaposlenikId: Number(zaposlenikId),
            naziv,
            vrsta,
            opis,
            datum: new Date(datum),
            datoteka: nazivDatoteke,
          },
        });

      res.json(dokument);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška kod dodavanja dokumenta.",
      });
    }
  }
);


app.delete(
  "/dokumenti/:id",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const dokument = await prisma.dokument.findUnique({
        where: {
          id: Number(req.params.id),
        },
      });

      if (!dokument) {
        return res.status(404).json({
          error: "Dokument nije pronađen.",
        });
      }

      const { error } = await supabase.storage
        .from("dokumenti")
        .remove([dokument.datoteka]);

      if (error) throw error;

      await prisma.dokument.delete({
        where: {
          id: Number(req.params.id),
        },
      });

      res.json({
        poruka: "Dokument obrisan.",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška kod brisanja dokumenta.",
      });
    }
  }
);

app.delete(
  "/radni-staz/:id",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      await prisma.radniStaz.delete({
        where: {
          id: Number(req.params.id),
        },
      });

      res.json({
        success: true,
      });
    } catch (error) {
  console.error(error);

  res.status(500).json({
    error: error.message,
  });
}
  }
);
app.post(
  "/obracun-go/:godina",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const godina = Number(req.params.godina);

      const zaposlenici =
        await prisma.zaposlenik.findMany({
          include: {
            radniStazovi: true,
          },
        });

      let obracuni = [];

for (const z of zaposlenici) {

  // PRETHODNI STAŽ

  let prethodniGodina = 0;
  let prethodniMjeseci = 0;
  let prethodniDani = 0;

  for (const s of z.radniStazovi) {

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

  // STAŽ U MIZ

  let godineUMIZ = 0;

  if (z.datumPocetka) {

    const danas = new Date();
    const pocetak = new Date(
      z.datumPocetka
    );

    godineUMIZ =
      danas.getFullYear() -
      pocetak.getFullYear();

    const mjesec =
      danas.getMonth() -
      pocetak.getMonth();

    if (
      mjesec < 0 ||
      (
        mjesec === 0 &&
        danas.getDate() <
          pocetak.getDate()
      )
    ) {
      godineUMIZ--;
    }
  }

  const ukupnoGodina =
    godineUMIZ +
    prethodniGodina;

  const obracun =
    izracunajGodisnjiPoPravilniku({
      ...z,
      ukupnoGodina,
    });

  const brojDanaGO =
    obracun.ukupno;

  const postoji =
    await prisma.obracunGO.findFirst({
      where: {
        zaposlenikId: z.id,
        godina,
      },
    });

  if (postoji) {

    await prisma.obracunGO.update({
      where: {
        id: postoji.id,
      },
      data: {
        brojDanaGO,
        datumObracuna:
          new Date(),
      },
    });

  } else {

    await prisma.obracunGO.create({
      data: {
        zaposlenikId: z.id,
        godina,
        brojDanaGO,
      },
    });

  }

  obracuni.push({
    zaposlenikId: z.id,
    zaposlenik: z.ime,
    godina,
    brojDanaGO,
    datumObracuna:
      new Date(),
  });

}

      res.json({
        godina,
        ukupno: obracuni.length,
        obracuni,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška kod obračuna GO.",
      });
    }
  }
);

app.get(
  "/obracun-go/:godina",
  provjeriToken,
  samoAdmin,
  async (req, res) => {
    try {
      const godina = Number(req.params.godina);

      const obracuni = await prisma.obracunGO.findMany({
        where: { godina },
        include: {
          zaposlenik: {
            select: {
              ime: true,
            },
          },
        },
        orderBy: {
          zaposlenik: {
            ime: "asc",
          },
        },
      });

      res.json(
        obracuni.map((o) => ({
          zaposlenikId: o.zaposlenikId,
          zaposlenik: o.zaposlenik.ime,
          godina: o.godina,
          brojDanaGO: o.brojDanaGO,
          datumObracuna: o.datumObracuna,
        }))
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: "Greška kod učitavanja obračuna.",
      });
    }
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
})