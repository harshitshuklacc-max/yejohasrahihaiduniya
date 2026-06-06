import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";

export default function TeacherAttendancePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Attendance</h2>
      <AttendanceCalendar apiPath="/api/teacher/attendance" />
    </div>
  );
}
