const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");

const prisma = new PrismaClient();
const app = express();

const resend = new Resend(process.env.RESEND_API_KEY);

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

function izracunajGodisnji(datum) {
  const danas = new Date();
  const pocetak = new Date(datum);

  let godine = danas.getFullYear() - pocetak.getFullYear();

  const mjesecRazlika = danas.getMonth() - pocetak.getMonth();
  const danRazlika = danas.getDate() - pocetak.getDate();

  if (mjesecRazlika < 0 || (mjesecRazlika === 0 && danRazlika < 0)) {
    godine--;
  }

  if (godine < 5) return 20;
  if (godine < 10) return 22;
  if (godine < 20) return 25;

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
    const { ime, email, lozinka, zaposlenikId } = req.body;

    const postoji = await prisma.korisnik.findUnique({
      where: { email },
    });

    if (postoji) {
      return res.status(400).json({ error: "Korisnik već postoji" });
    }

    const hashovanaLozinka = await bcrypt.hash(lozinka, 10);

    await prisma.korisnik.create({
      data: {
        ime,
        email,
        lozinka: hashovanaLozinka,
        uloga: "zaposlenik",
        odobren: false,
        zaposlenikId: zaposlenikId ? Number(zaposlenikId) : null,
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
app.get("/zaposlenici-javno", async (req, res) => {
  try {
    const zaposlenici = await prisma.zaposlenik.findMany({
      select: {
        id: true,
        ime: true,
      },
      orderBy: {
        ime: "asc",
      },
    });

    res.json(zaposlenici);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Greška kod učitavanja zaposlenika",
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
      orderBy: { id: "desc" },
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
      const zaposlenici =
        await prisma.zaposlenik.findMany({
          include: { odmori: true },
          orderBy: { id: "asc" },
        });

      const rezultat =
        await Promise.all(
          zaposlenici.map(async (z) => {
            let iskoristeno = 0;

            for (const o of z.odmori) {
              if (
                o.status === "odobreno" &&
                o.vrsta === "Godišnji odmor"
              ) {
                iskoristeno += await brojDana(
                  o.od,
                  o.do
                );
              }
            }

            return {
              id: z.id,
              ime: z.ime,
              pozicija: z.pozicija,
              godisnji: z.godisnji,
              iskoristeno,
              preostalo:
                z.godisnji - iskoristeno,
            };
          })
        );

      res.json(rezultat);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error:
          "Greška kod učitavanja zaposlenika",
      });
    }
  }
);

app.post("/zaposlenici", provjeriToken, samoAdmin, async (req, res) => {
  try {
    const { ime, pozicija, datumPocetka } = req.body;

    const godisnji = izracunajGodisnji(datumPocetka);

    const novi = await prisma.zaposlenik.create({
      data: {
        ime,
        pozicija,
        godisnji,
      },
    });

    res.json(novi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod dodavanja zaposlenika" });
  }
});

app.put("/zaposlenici/:id", provjeriToken, samoAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ime, pozicija, godisnji } = req.body;

    const update = await prisma.zaposlenik.update({
      where: { id: Number(id) },
      data: {
        ime,
        pozicija,
        godisnji: Number(godisnji),
      },
    });

    res.json(update);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Greška kod izmjene zaposlenika" });
  }
});

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
    });

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server radi na portu ${PORT}`);
});