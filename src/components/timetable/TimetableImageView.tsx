"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function TimetableImageView() {
  const [image, setImage] = useState<{ imageUrl: string; title?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/timetable")
      .then((r) => r.json())
      .then((data) => setImage(data?.imageUrl ? data : null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-shimmer h-96 rounded-2xl" />;

  if (!image) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Timetable</h2>
        <p className="text-ssa-muted glass rounded-xl p-6">
          Timetable image has not been uploaded yet. Admin will add it soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{image.title || "Timetable"}</h2>
      <div className="glass rounded-2xl p-4 overflow-hidden">
        <Image
          src={image.imageUrl}
          alt={image.title || "Timetable"}
          width={1200}
          height={800}
          className="w-full h-auto rounded-xl"
          unoptimized
        />
      </div>
    </div>
  );
}
