import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";

export default function TeacherAttendancePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Attendance</h2>
      <p className="text-sm text-ssa-muted">
        Biometric attendance uploaded by admin. Green = present, red = absent.
      </p>
      <AttendanceCalendar apiPath="/api/teacher/attendance" />
    </div>
  );
}
