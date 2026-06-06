import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export const teacherSchema = z.object({
  name: z.string().min(2),
  subject: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.string().optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const studentSchema = z.object({
  name: z.string().min(2),
  classLevel: z.string().min(1),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  totalFees: z.number().optional(),
  dueDate: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const timetableImageSchema = z.object({
  imageUrl: z.string().min(1),
  title: z.string().optional(),
});

export const biometricReportSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  pdfUrl: z.string().min(1),
  personType: z.enum(["STUDENT", "TEACHER"]),
  records: z
    .array(
      z.object({
        personName: z.string().min(1),
        date: z.string(),
        status: z.enum(["PRESENT", "ABSENT", "LATE"]),
      })
    )
    .optional(),
});

export const homeworkSchema = z.object({
  classLevel: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string(),
  attachments: z.array(z.string()).optional(),
  targetStudentIds: z.array(z.string()).optional(),
});

export const feeUpdateSchema = z.object({
  totalFees: z.number().optional(),
  paidFees: z.number().optional(),
  dueDate: z.string().optional(),
  payment: z
    .object({
      amount: z.number().positive(),
      method: z.string().optional(),
      note: z.string().optional(),
    })
    .optional(),
});

export const leaveSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(3),
});

export const leaveReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminRemark: z.string().optional(),
});

export const testSchema = z.object({
  classLevel: z.string().min(1),
  subject: z.string().min(1),
  syllabus: z.string().optional(),
  testDate: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  instructions: z.string().optional(),
  targetStudentIds: z.array(z.string()).optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  classLevel: z.string().optional().nullable(),
  targetRole: z.string().optional(),
});

