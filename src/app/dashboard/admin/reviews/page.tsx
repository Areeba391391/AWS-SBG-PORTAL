"use client";

import { Star, Trash2 } from "lucide-react";
import { useData } from "@/context/DataContext";

export default function AdminReviewsPage() {
  const { reviews, courses, deleteReview } = useData();
  const sorted = [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Reviews</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Real reviews students submit after finishing a course. The latest ones also show up as testimonials on the homepage.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <Star className="h-8 w-8 text-orange mx-auto mb-3" />
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
            No reviews yet — they'll appear here once students complete a course and leave feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((r) => {
            const course = courses.find((c) => c.id === r.courseId);
            return (
              <div key={r.id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-heading-light dark:text-heading-dark">{r.userName}</p>
                    <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-0.5">
                      {course?.title ?? "Unknown course"} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => deleteReview(r.id)} className="text-red-500 hover:text-red-600 flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-0.5 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-orange text-orange" : "text-border-light dark:text-border-dark"}`} />
                  ))}
                </div>
                {r.comment && <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-3">{r.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
