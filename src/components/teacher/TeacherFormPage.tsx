"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { formatDate } from "@/lib/utils";
import { CLASS_LEVELS } from "@/lib/classes";

type ClassStudent = {
  id: string;
  user: { name: string; username: string };
};

function ClassStudentPicker({
  classLevel,
  selected,
  onChange,
}: {
  classLevel: string;
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [students, setStudents] = useState<ClassStudent[]>([]);

  useEffect(() => {
    if (!classLevel) {
      setStudents([]);
      return;
    }
    fetch(`/api/teacher/students?classLevel=${encodeURIComponent(classLevel)}`)
      .then((r) => r.json())
      .then(setStudents);
  }, [classLevel]);

  if (!classLevel || students.length === 0) return null;

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-ssa-muted">
        Select specific students (optional — leave empty to notify entire class)
      </p>
      <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-white/10 p-3">
        {students.map((s) => (
          <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(s.id)}
              onChange={() => toggle(s.id)}
              className="rounded"
            />
            {s.user.name}
          </label>
        ))}
      </div>
    </div>
  );
}

export function TeacherHomeworkPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<{ id: string; title: string; dueDate: string; classLevel: string }[]>([]);
  const [form, setForm] = useState({
    classLevel: "",
    title: "",
    description: "",
    dueDate: "",
    targetStudentIds: [] as string[],
  });

  useEffect(() => {
    fetch("/api/teacher/homework").then((r) => r.json()).then(setItems);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/teacher/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    toast(res.ok ? "Homework posted — class notified" : "Failed", res.ok ? "success" : "error");
    if (res.ok) {
      setForm({ classLevel: "", title: "", description: "", dueDate: "", targetStudentIds: [] });
      fetch("/api/teacher/homework").then((r) => r.json()).then(setItems);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Homework</h2>
      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4 max-w-lg">
        <select
          value={form.classLevel}
          onChange={(e) => setForm({ ...form, classLevel: e.target.value, targetStudentIds: [] })}
          required
        >
          <option value="">Select class</option>
          {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <ClassStudentPicker
          classLevel={form.classLevel}
          selected={form.targetStudentIds}
          onChange={(ids) => setForm({ ...form, targetStudentIds: ids })}
        />
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
        <button type="submit" className="btn-primary">Post Homework</button>
      </form>
      <div className="space-y-3">
        {items.map((h) => (
          <div key={h.id} className="glass rounded-xl p-4">
            <p className="font-semibold">{h.title}</p>
            <p className="text-xs text-ssa-muted">{h.classLevel} · Due {formatDate(h.dueDate)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeacherMaterialsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ classLevel: "", title: "", fileUrl: "", description: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/teacher/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    toast(res.ok ? "Material uploaded" : "Failed", res.ok ? "success" : "error");
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Study Materials</h2>
      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4 max-w-lg">
        <select value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })} required>
          <option value="">Select class</option>
          {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="File URL (PDF/Drive link)" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button type="submit" className="btn-primary">Upload Notes</button>
      </form>
    </div>
  );
}

export function TeacherTestsPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    classLevel: "",
    subject: "",
    syllabus: "",
    testDate: "",
    startTime: "",
    endTime: "",
    instructions: "",
    targetStudentIds: [] as string[],
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/teacher/tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    toast(res.ok ? "Test scheduled — class notified" : "Failed", res.ok ? "success" : "error");
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Test Schedule</h2>
      <form onSubmit={submit} className="glass rounded-2xl p-6 grid gap-4 sm:grid-cols-2 max-w-2xl">
        <select
          value={form.classLevel}
          onChange={(e) => setForm({ ...form, classLevel: e.target.value, targetStudentIds: [] })}
          required
          className="sm:col-span-2"
        >
          <option value="">Select class</option>
          {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="sm:col-span-2">
          <ClassStudentPicker
            classLevel={form.classLevel}
            selected={form.targetStudentIds}
            onChange={(ids) => setForm({ ...form, targetStudentIds: ids })}
          />
        </div>
        <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        <input type="date" value={form.testDate} onChange={(e) => setForm({ ...form, testDate: e.target.value })} required />
        <input type="time" placeholder="Start" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        <input type="time" placeholder="End" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        <textarea placeholder="Syllabus" className="sm:col-span-2" value={form.syllabus} onChange={(e) => setForm({ ...form, syllabus: e.target.value })} />
        <textarea placeholder="Instructions" className="sm:col-span-2" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
        <button type="submit" className="btn-primary sm:col-span-2">Schedule Test</button>
      </form>
    </div>
  );
}

export function TeacherLeavePage() {
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<{ id: string; startDate: string; endDate: string; reason: string; status: string; adminRemark?: string }[]>([]);
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });

  function load() {
    fetch("/api/teacher/leaves").then((r) => r.json()).then(setLeaves);
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/teacher/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    toast(res.ok ? "Leave submitted" : "Failed", res.ok ? "success" : "error");
    if (res.ok) {
      setForm({ startDate: "", endDate: "", reason: "" });
      load();
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Leave Management</h2>
      <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4 max-w-lg">
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
        <textarea placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required rows={3} />
        <button type="submit" className="btn-primary">Submit Leave Request</button>
      </form>
      <div className="space-y-3">
        {leaves.map((l) => (
          <div key={l.id} className="glass rounded-xl p-4">
            <p className="font-medium">{formatDate(l.startDate)} — {formatDate(l.endDate)}</p>
            <p className="text-sm text-ssa-muted">{l.reason}</p>
            <span className="text-xs mt-2 inline-block px-2 py-0.5 rounded bg-ssa-primary/20">{l.status}</span>
            {l.adminRemark && <p className="text-xs mt-2 text-ssa-muted">Admin: {l.adminRemark}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
