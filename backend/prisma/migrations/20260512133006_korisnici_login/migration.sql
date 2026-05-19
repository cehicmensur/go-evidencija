-- CreateTable
CREATE TABLE "Korisnik" (
    "id" SERIAL NOT NULL,
    "ime" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lozinka" TEXT NOT NULL,
    "uloga" TEXT NOT NULL DEFAULT 'admin',

    CONSTRAINT "Korisnik_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Korisnik_email_key" ON "Korisnik"("email");
