"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

export default function AdminHomeworkPage() {
  const [items, setItems] = useState<
    { id: string; title: string; dueDate: string; classLevel: string; teacher: { user: { name: string } } }[]
  >([]);

  useEffect(() => {
    fetch("/api/admin/homework").then((r) => r.json()).then(setItems);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All Homework</h2>
      <div className="space-y-3">
        {items.map((h) => (
          <div key={h.id} className="glass rounded-xl p-4">
            <p className="font-semibold">{h.title}</p>
            <p className="text-xs text-ssa-muted">{h.classLevel} · {h.teacher.user.name}</p>
            <p className="text-xs text-ssa-muted">Due {formatDate(h.dueDate)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
