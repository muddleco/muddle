/*
  Warnings:

  - The `key` column on the `App` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "App" DROP COLUMN "key",
ADD COLUMN     "key" JSONB;
