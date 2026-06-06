import { prisma } from "./prisma";
import { monthRange } from "./attendance";
import { namesMatch } from "./name-match";

type PersonType = "STUDENT" | "TEACHER";

export async function getBiometricRecordsForPerson(opts: {
  personType: PersonType;
  personName: string;
  studentId?: string | null;
  teacherId?: string | null;
  year: number;
  month: number;
}) {
  const { start, end } = monthRange(opts.year, opts.month);

  const report = await prisma.biometricAttendanceReport.findFirst({
    where: { month: opts.month, year: opts.year, personType: opts.personType },
  });

  if (!report) {
    return { records: [], pdfUrl: null, personName: opts.personName };
  }

  const allRecords = await prisma.biometricAttendanceRecord.findMany({
    where: {
      reportId: report.id,
      date: { gte: start, lte: end },
      OR: [
        ...(opts.studentId ? [{ studentId: opts.studentId }] : []),
        ...(opts.teacherId ? [{ teacherId: opts.teacherId }] : []),
        { personName: opts.personName },
      ],
    },
    orderBy: { date: "asc" },
  });

  const records = allRecords.filter(
    (r) =>
      (opts.studentId && r.studentId === opts.studentId) ||
      (opts.teacherId && r.teacherId === opts.teacherId) ||
      namesMatch(r.personName, opts.personName)
  );

  return {
    records: records.map((r) => ({ date: r.date, status: r.status })),
    pdfUrl: report.pdfUrl,
    personName: opts.personName,
  };
}

export async function searchBiometricByName(opts: {
  name: string;
  personType: PersonType;
  year: number;
  month: number;
}) {
  const { start, end } = monthRange(opts.year, opts.month);

  const report = await prisma.biometricAttendanceReport.findFirst({
    where: { month: opts.month, year: opts.year, personType: opts.personType },
  });

  if (!report) return { records: [], pdfUrl: null, matchedName: opts.name };

  const records = await prisma.biometricAttendanceRecord.findMany({
    where: {
      reportId: report.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
  });

  const filtered = records.filter((r) => namesMatch(r.personName, opts.name));

  return {
    records: filtered.map((r) => ({ date: r.date, status: r.status, personName: r.personName })),
    pdfUrl: report.pdfUrl,
    matchedName: filtered[0]?.personName ?? opts.name,
  };
}
