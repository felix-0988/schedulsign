-- AlterTable
ALTER TABLE "CalendarConnection" ADD COLUMN     "checkConflicts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "label" TEXT;
