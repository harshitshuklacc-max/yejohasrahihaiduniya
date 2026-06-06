import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run(sql: string) {
  await prisma.$executeRawUnsafe(sql);
}

async function main() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Batch'
  `;

  if (tables.length === 0) {
    console.log("No Batch table — schema may already be migrated.");
    return;
  }

  console.log("Migrating legacy batch data to classLevel...");

  const alters = [
    `ALTER TABLE "TimetableSlot" ADD COLUMN IF NOT EXISTS "classLevel" TEXT`,
    `ALTER TABLE "Homework" ADD COLUMN IF NOT EXISTS "classLevel" TEXT`,
    `ALTER TABLE "StudyMaterial" ADD COLUMN IF NOT EXISTS "classLevel" TEXT`,
    `ALTER TABLE "TestSchedule" ADD COLUMN IF NOT EXISTS "classLevel" TEXT`,
    `ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "classLevel" TEXT`,
    `ALTER TABLE "Homework" ADD COLUMN IF NOT EXISTS "targetStudentIds" TEXT DEFAULT '[]'`,
    `ALTER TABLE "TestSchedule" ADD COLUMN IF NOT EXISTS "targetStudentIds" TEXT DEFAULT '[]'`,
  ];

  for (const sql of alters) await run(sql);

  const updates = [
    `UPDATE "TimetableSlot" t SET "classLevel" = b."classLevel" FROM "Batch" b WHERE t."batchId" = b.id AND t."classLevel" IS NULL`,
    `UPDATE "Homework" h SET "classLevel" = b."classLevel" FROM "Batch" b WHERE h."batchId" = b.id AND h."classLevel" IS NULL`,
    `UPDATE "StudyMaterial" m SET "classLevel" = b."classLevel" FROM "Batch" b WHERE m."batchId" = b.id AND m."classLevel" IS NULL`,
    `UPDATE "TestSchedule" t SET "classLevel" = b."classLevel" FROM "Batch" b WHERE t."batchId" = b.id AND t."classLevel" IS NULL`,
    `UPDATE "Announcement" a SET "classLevel" = b."classLevel" FROM "Batch" b WHERE a."batchId" = b.id AND a."classLevel" IS NULL`,
    `UPDATE "TimetableSlot" SET "classLevel" = '10th' WHERE "classLevel" IS NULL`,
    `UPDATE "Homework" SET "classLevel" = '10th' WHERE "classLevel" IS NULL`,
    `UPDATE "StudyMaterial" SET "classLevel" = '10th' WHERE "classLevel" IS NULL`,
    `UPDATE "TestSchedule" SET "classLevel" = '10th' WHERE "classLevel" IS NULL`,
  ];

  for (const sql of updates) await run(sql);

  console.log("Pre-migration complete. Run prisma db push next.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
