"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AdminAttendancePage() {
  const { toast } = useToast();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [personType, setPersonType] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [pdfUrl, setPdfUrl] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [reports, setReports] = useState<{ personType: string; _count: { records: number } }[]>([]);

  function loadReports() {
    fetch(`/api/admin/attendance?month=${month}&year=${year}`)
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []));
  }

  useEffect(() => { loadReports(); }, [month, year]);

  async function uploadReport(e: React.FormEvent) {
    e.preventDefault();

    const records = bulkText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [personName, date, status] = line.split(",").map((s) => s.trim());
        return {
          personName,
          date,
          status: (status?.toUpperCase() || "PRESENT") as "PRESENT" | "ABSENT" | "LATE",
        };
      })
      .filter((r) => r.personName && r.date);

    const res = await fetch("/api/admin/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, year, pdfUrl, personType, records }),
    });

    const data = await res.json();
    toast(
      res.ok ? `Uploaded — ${data.recordCount ?? 0} records saved` : "Upload failed",
      res.ok ? "success" : "error"
    );
    if (res.ok) {
      setBulkText("");
      loadReports();
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Biometric Attendance</h2>

      <form onSubmit={uploadReport} className="glass rounded-2xl p-6 space-y-4 max-w-2xl">
        <h3 className="font-semibold">Upload Monthly Report</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min={2020}
            max={2100}
          />
          <select value={personType} onChange={(e) => setPersonType(e.target.value as "STUDENT" | "TEACHER")}>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
          </select>
        </div>
        <input
          placeholder="Biometric PDF URL (Google Drive / direct link)"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          required
        />
        <div>
          <label className="text-sm text-ssa-muted block mb-2">
            Attendance records (one per line: Name, YYYY-MM-DD, PRESENT or ABSENT)
          </label>
          <textarea
            rows={8}
            placeholder={"Rahul Kumar, 2026-06-01, PRESENT\nPriya Sharma, 2026-06-01, ABSENT"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <button type="submit" className="btn-primary">Save Monthly Attendance</button>
      </form>

      <div className="glass rounded-xl p-4 text-sm">
        <p className="font-medium mb-2">Reports for {MONTHS[month - 1]} {year}</p>
        {reports.length === 0 ? (
          <p className="text-ssa-muted">No reports uploaded yet.</p>
        ) : (
          <ul className="space-y-1 text-ssa-muted">
            {reports.map((r) => (
              <li key={r.personType}>
                {r.personType === "STUDENT" ? "Students" : "Teachers"}: {r._count.records} records
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass rounded-2xl p-6 space-y-4 max-w-2xl">
        <h3 className="font-semibold">Look up by name</h3>
        <div className="flex gap-2 flex-wrap">
          <input
            placeholder="Student or teacher name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <select value={personType} onChange={(e) => setPersonType(e.target.value as "STUDENT" | "TEACHER")}>
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
          </select>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setSearching(true)}
          >
            Search
          </button>
        </div>
      </div>

      {searching && searchName && (
        <AttendanceCalendar
          apiPath="/api/admin/attendance"
          personLabel={searchName}
          extraParams={{ name: searchName, personType }}
        />
      )}
    </div>
  );
}
