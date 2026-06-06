import { NextRequest } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getStudentSession();
  if (!session?.studentId) return jsonError("Unauthorized", 401);

  const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";

  const notifications = await prisma.notification.findMany({
    where: {
      studentId: session.studentId,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return jsonOk(notifications);
}

export async function PATCH(req: NextRequest) {
  const session = await getStudentSession();
  if (!session?.studentId) return jsonError("Unauthorized", 401);

  const { id } = await req.json();
  if (!id) return jsonError("id required");

  await prisma.notification.updateMany({
    where: { id, studentId: session.studentId },
    data: { isRead: true },
  });

  return jsonOk({ ok: true });
}
