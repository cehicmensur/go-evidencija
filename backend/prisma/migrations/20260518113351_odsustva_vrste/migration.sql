-- AlterTable
ALTER TABLE "GodisnjiOdmor" ADD COLUMN     "napomena" TEXT,
ADD COLUMN     "odbijaSeOdGodisnjeg" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "vrsta" TEXT NOT NULL DEFAULT 'Godišnji odmor';
