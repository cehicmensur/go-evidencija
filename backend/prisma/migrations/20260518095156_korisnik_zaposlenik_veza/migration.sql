/*
  Warnings:

  - A unique constraint covering the columns `[zaposlenikId]` on the table `Korisnik` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GodisnjiOdmor" ALTER COLUMN "status" SET DEFAULT 'na čekanju';

-- AlterTable
ALTER TABLE "Korisnik" ADD COLUMN     "zaposlenikId" INTEGER,
ALTER COLUMN "uloga" SET DEFAULT 'zaposlenik';

-- CreateIndex
CREATE UNIQUE INDEX "Korisnik_zaposlenikId_key" ON "Korisnik"("zaposlenikId");

-- AddForeignKey
ALTER TABLE "Korisnik" ADD CONSTRAINT "Korisnik_zaposlenikId_fkey" FOREIGN KEY ("zaposlenikId") REFERENCES "Zaposlenik"("id") ON DELETE SET NULL ON UPDATE CASCADE;
