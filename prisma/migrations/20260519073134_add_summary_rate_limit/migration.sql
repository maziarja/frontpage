-- AlterTable
ALTER TABLE "UserPreference" ADD COLUMN     "summaryLastResetAt" TIMESTAMP(3),
ADD COLUMN     "summaryRequestsToday" INTEGER NOT NULL DEFAULT 0;
