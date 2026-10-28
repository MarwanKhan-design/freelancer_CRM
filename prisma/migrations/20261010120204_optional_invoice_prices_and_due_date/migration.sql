-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "dueDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" DROP NOT NULL;
