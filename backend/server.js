const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");

const prisma = new PrismaClient();
const app = express();

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

function izracunajGodisnji(
  datum,
  prethodniStazGodina = 0,
  prethodniStazMjeseci = 0
) {
  const danas = new Date();
  const pocetak = new Date(datum);

  let godineUMIZ =
    danas.getFullYear() -
    pocetak.getFullYear();

  const mjesecRazlika =
    danas.getMonth() -
    pocetak.getMonth();

  const danRazlika =
    danas.getDate() -
    pocetak.getDate();

  if (
    mjesecRazlika < 0 ||
    (mjesecRazlika === 0 &&
      danRazlika < 0)
  ) {
    godineUMIZ--;
  }

  let ukupnoGodina =
    godineUMIZ +
    Number(prethodniStazGodina || 0);

  if (
    Number(prethodniStazMjeseci || 0) >= 12
  ) {
    ukupnoGodina += Math.floor(
      prethodniStazMjeseci / 12
    );
  }

  if (ukupnoGodina < 5) return 20;
  if (ukupnoGodina < 10) return 22;
  if (ukupnoGodina < 20) return 25;

  return 30;
}

async function brojDana(od, doDatuma) {
  const start = new Date(od);
  const end = new Date(doDatuma);

  const neradniDani = await prisma.neradniDan.findMany();

  const praznici = neradniDani.map((d) =>
    new Date(d.datum).toISOString().split("T")[0]
  );

  let broj = 0;

  const trenutni = new Date(start);

  while (trenutni <= end) {
    const danUSedmici = trenutni.getDay();

    const datumString = trenutni.toISOString().split("T")[0];

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

app.get("/", (req, res) => {
  res.send("Backend radi!");
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
    console.error(error);
    res.status(500).json({ error: "Greška kod registracije" });
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

      // Sortiranje po prezimenu
      zaposlenici.sort((a, b) => {
        const prezimeA = a.ime.trim().split(" ").pop();
        const prezimeB = b.ime.trim().split(" ").pop();

        return prezimeA.localeCompare(prezimeB, "bs");
      });

      const rezultat = await Promise.all(
        zaposlenici.map(async (z) => {
          let iskoristeno = 0;

          // Prethodni staž iz tabele RadniStaz
          let prethodniMjeseci = 0;

          for (const s of z.radniStazovi) {
            const od = new Date(s.datumOd);
            const doDatum = new Date(s.datumDo);

            let mjeseci =
              (doDatum.getFullYear() - od.getFullYear()) * 12 +
              (doDatum.getMonth() - od.getMonth());

            prethodniMjeseci += mjeseci;
          }

          const prethodniGodina = Math.floor(prethodniMjeseci / 12);
          const ostatakMjeseci = prethodniMjeseci % 12;

          // Iskorišteni godišnji
          for (const o of z.odmori) {
            if (
              o.status === "odobreno" &&
              o.odbijaSeOdGodisnjeg
            ) {
              iskoristeno += await brojDana(o.od, o.do);
            }
          }

 // Staž u MIZ
let godineUMIZ = 0;
let mjeseciUMIZ = 0;
let daniUMIZ = 0;

if (z.datumPocetka) {
  const danas = new Date();
  const pocetak = new Date(z.datumPocetka);

  let godine = danas.getFullYear() - pocetak.getFullYear();
  let mjeseci = danas.getMonth() - pocetak.getMonth();
  let dani = danas.getDate() - pocetak.getDate();

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
let ukupnoGodina = prethodniGodina + godineUMIZ;
let ukupnoMjeseci = ostatakMjeseci + mjeseciUMIZ;
let ukupnoDana = daniUMIZ;

if (ukupnoMjeseci >= 12) {
  ukupnoGodina += Math.floor(ukupnoMjeseci / 12);
  ukupnoMjeseci = ukupnoMjeseci % 12;
}

const ukupnoGO =
  z.godisnji + (z.dodatniDani || 0);
  
          return {
            ...z,
            ukupnoGodina,
            ukupnoMjeseci,
            ukupnoDana,
            iskoristeno,
            preostalo: ukupnoGO - iskoristeno,
          };
        })
      );

      res.json(rezultat);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Greška kod učitavanja zaposlenika",
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

    const godisnji = izracunajGodisnji(
      datumPocetka,
      prethodniStazGodina,
      prethodniStazMjeseci
    );

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
    datum: new Date(datum),
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

      res.json(podaci);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Greška kod učitavanja staža",
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
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});