import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run(sql: string) {
  try {
    await prisma.$executeRawUnsafe(sql);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("does not exist") || msg.includes("already exists")) return;
    throw e;
  }
}

async function main() {
  console.log("Finalizing schema migration...");

  const steps = [
    `UPDATE "Student" SET "batchId" = NULL WHERE "batchId" IS NOT NULL`,
    `ALTER TABLE "Attendance" DROP COLUMN IF EXISTS "batchId"`,
    `ALTER TABLE "TimetableSlot" DROP COLUMN IF EXISTS "batchId"`,
    `ALTER TABLE "Homework" DROP COLUMN IF EXISTS "batchId"`,
    `ALTER TABLE "StudyMaterial" DROP COLUMN IF EXISTS "batchId"`,
    `ALTER TABLE "TestSchedule" DROP COLUMN IF EXISTS "batchId"`,
    `ALTER TABLE "Announcement" DROP COLUMN IF EXISTS "batchId"`,
    `ALTER TABLE "Student" DROP COLUMN IF EXISTS "batchId"`,
    `DROP TABLE IF EXISTS "BatchTeacher" CASCADE`,
    `DROP TABLE IF EXISTS "Batch" CASCADE`,
    `CREATE TABLE IF NOT EXISTS "TeacherAttendance" (
      "id" TEXT NOT NULL,
      "teacherId" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
      "note" TEXT,
      CONSTRAINT "TeacherAttendance_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "TeacherAttendance_teacherId_date_key" ON "TeacherAttendance"("teacherId", "date")`,
    `CREATE TABLE IF NOT EXISTS "Notification" (
      "id" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "refId" TEXT,
      "isRead" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
    )`,
    `ALTER TABLE "TimetableSlot" ALTER COLUMN "classLevel" SET NOT NULL`,
    `ALTER TABLE "Homework" ALTER COLUMN "classLevel" SET NOT NULL`,
    `ALTER TABLE "StudyMaterial" ALTER COLUMN "classLevel" SET NOT NULL`,
    `ALTER TABLE "TestSchedule" ALTER COLUMN "classLevel" SET NOT NULL`,
  ];

  for (const sql of steps) {
    console.log("→", sql.slice(0, 80) + "...");
    await run(sql);
  }

  console.log("Done. Run: npx prisma db push");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
