"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Modal } from "@/components/Modal";

export function ReviewModal({
  open,
  onClose,
  onSubmit,
  courseTitle,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  courseTitle: string;
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Leave a Review">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(rating, comment.trim());
          setComment("");
          setRating(5);
        }}
        className="space-y-5"
      >
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
          You just finished <span className="font-semibold text-heading-light dark:text-heading-dark">{courseTitle}</span> 🎉 — how was it?
        </p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  (hover || rating) >= n ? "fill-orange text-orange" : "text-border-light dark:text-border-dark"
                }`}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Share a bit about your experience (optional)"
          className="w-full rounded-xl border border-border-light dark:border-white/20 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-orange dark:text-white resize-none"
        />
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1 justify-center">
            Submit Review
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
            Skip
          </button>
        </div>
      </form>
    </Modal>
  );
}
