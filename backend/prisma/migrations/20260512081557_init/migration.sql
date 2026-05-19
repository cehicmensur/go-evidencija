-- CreateTable
CREATE TABLE "Zaposlenik" (
    "id" SERIAL NOT NULL,
    "ime" TEXT NOT NULL,
    "pozicija" TEXT NOT NULL,
    "godisnji" INTEGER NOT NULL,

    CONSTRAINT "Zaposlenik_pkey" PRIMARY KEY ("id")
);
