"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type AttendanceRecord = { date: string; status: "PRESENT" | "ABSENT" | "LATE" };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function AttendanceCalendar({
  apiPath,
  personLabel,
  extraParams,
}: {
  apiPath: string;
  personLabel?: string;
  extraParams?: Record<string, string>;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
      ...extraParams,
    });
    fetch(`${apiPath}?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRecords(data.records ?? []);
        setPdfUrl(data.pdfUrl ?? null);
        setMatchedName(data.personName ?? data.matchedName ?? null);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [year, month, apiPath, JSON.stringify(extraParams)]);

  const recordMap = new Map(records.map((r) => [r.date.slice(0, 10), r.status]));

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;

  return (
    <div className="space-y-6">
      {(matchedName || personLabel) && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm text-ssa-muted">Attendance for</p>
          <p className="font-semibold">{matchedName || personLabel}</p>
          <p className="text-xs text-ssa-muted mt-1">
            {presentCount} present · {absentCount} absent this month
          </p>
        </div>
      )}

      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glass rounded-2xl p-4 flex items-center gap-3 card-hover block"
        >
          <FileText className="h-8 w-8 text-ssa-primary shrink-0" />
          <div>
            <p className="font-semibold text-sm">Biometric Attendance PDF</p>
            <p className="text-xs text-ssa-muted">{MONTHS[month - 1]} {year} — View / Download</p>
          </div>
        </a>
      )}

      {!pdfUrl && !loading && records.length === 0 && (
        <p className="text-ssa-muted text-sm glass rounded-xl p-4">
          No biometric attendance uploaded for {MONTHS[month - 1]} {year} yet. Admin will add the monthly PDF.
        </p>
      )}

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={prevMonth} className="rounded-lg p-2 hover:bg-white/5">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-semibold">{MONTHS[month - 1]} {year}</h3>
          <button type="button" onClick={nextMonth} className="rounded-lg p-2 hover:bg-white/5">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="loading-shimmer h-64 rounded-xl" />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-ssa-muted mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const status = recordMap.get(key);
                return (
                  <div
                    key={key}
                    className={cn(
                      "aspect-square flex items-center justify-center rounded-lg text-sm font-medium",
                      status === "PRESENT" && "bg-green-600/30 text-green-300 border border-green-500/50",
                      status === "ABSENT" && "bg-red-600/30 text-red-300 border border-red-500/50",
                      status === "LATE" && "bg-yellow-600/30 text-yellow-300 border border-yellow-500/50",
                      !status && "bg-white/5 text-ssa-muted",
                      key === todayKey && !status && "ring-1 ring-ssa-primary"
                    )}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-4 text-xs text-ssa-muted">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-600/50" /> Present</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600/50" /> Absent</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
