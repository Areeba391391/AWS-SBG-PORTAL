"use client";

import { EventCard } from "@/components/EventCard";
import { useData } from "@/context/DataContext";

export default function StudentEventsPage() {
  const { events } = useData();
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Events</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Register for upcoming workshops, hackathons, and bootcamps.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {events.map((e, i) => (
          <EventCard key={e.id} event={e} index={i} />
        ))}
      </div>
    </div>
  );
}
