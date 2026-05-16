-- AlterTable
ALTER TABLE "Feed" ADD COLUMN     "lastSuccessfulFetchAt" TIMESTAMP(3),
ADD COLUMN     "nextRetryAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
