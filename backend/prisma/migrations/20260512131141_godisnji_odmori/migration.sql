-- CreateTable
CREATE TABLE "GodisnjiOdmor" (
    "id" SERIAL NOT NULL,
    "zaposlenikId" INTEGER NOT NULL,
    "od" TIMESTAMP(3) NOT NULL,
    "do" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'cekanje',

    CONSTRAINT "GodisnjiOdmor_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GodisnjiOdmor" ADD CONSTRAINT "GodisnjiOdmor_zaposlenikId_fkey" FOREIGN KEY ("zaposlenikId") REFERENCES "Zaposlenik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
