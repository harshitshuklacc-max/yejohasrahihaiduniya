import { prisma } from "./prisma";
import { parseJsonArray } from "./utils";

export async function notifyClassStudents(opts: {
  classLevel: string;
  targetStudentIds?: string[];
  title: string;
  body: string;
  type: "HOMEWORK" | "TEST";
  refId: string;
}) {
  const explicitIds = opts.targetStudentIds?.filter(Boolean) ?? [];
  const students =
    explicitIds.length > 0
      ? await prisma.student.findMany({
          where: {
            id: { in: explicitIds },
            classLevel: opts.classLevel,
            isArchived: false,
          },
          select: { id: true },
        })
      : await prisma.student.findMany({
          where: { classLevel: opts.classLevel, isArchived: false },
          select: { id: true },
        });

  if (students.length === 0) return 0;

  await prisma.notification.createMany({
    data: students.map((s) => ({
      studentId: s.id,
      title: opts.title,
      body: opts.body,
      type: opts.type,
      refId: opts.refId,
    })),
  });

  return students.length;
}

export function resolveTargetStudentIds(raw: string | undefined): string[] {
  if (!raw) return [];
  return parseJsonArray<string>(raw);
}
