"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/providers/ToastProvider";

export default function AdminTimetablePage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ imageUrl: "", title: "Class Timetable" });
  const [current, setCurrent] = useState<{ imageUrl: string; title?: string } | null>(null);

  function load() {
    fetch("/api/admin/timetable").then((r) => r.json()).then((d) => {
      if (d?.imageUrl) {
        setCurrent(d);
        setForm({ imageUrl: d.imageUrl, title: d.title || "Class Timetable" });
      }
    });
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/timetable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    toast(res.ok ? "Timetable image saved" : "Failed", res.ok ? "success" : "error");
    if (res.ok) load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Timetable Image</h2>
      <p className="text-sm text-ssa-muted">
        Upload one timetable image. It will be visible to all students and teachers in their portals.
      </p>

      <form onSubmit={save} className="glass rounded-2xl p-6 space-y-4 max-w-lg">
        <input
          placeholder="Title (e.g. June 2026 Timetable)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Image URL (PNG/JPG — Google Drive direct link or image host)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          required
        />
        <button type="submit" className="btn-primary">Save Timetable Image</button>
      </form>

      {current?.imageUrl && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium mb-3">Preview</p>
          <Image
            src={current.imageUrl}
            alt={current.title || "Timetable"}
            width={1000}
            height={700}
            className="w-full h-auto rounded-xl"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
