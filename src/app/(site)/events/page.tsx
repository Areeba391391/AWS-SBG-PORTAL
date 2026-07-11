"use client";

import { SectionHeading } from "@/components/SectionHeading";
import { EventCard } from "@/components/EventCard";
import { useData } from "@/context/DataContext";

export default function EventsPage() {
  const { events } = useData();

  return (
    <div className="pt-32 pb-20 container-page">
      <SectionHeading
        eyebrow="Stay Updated"
        title="Upcoming events"
        description="Workshops, hackathons, seminars, and bootcamps — stay updated with our latest events."
      />
      {events.length === 0 && (
        <p className="mt-14 text-center text-paragraph-light dark:text-paragraph-dark">No events scheduled yet.</p>
      )}
      <div className="mt-10 grid md:grid-cols-2 gap-5 max-w-4xl">
        {events.map((e, i) => (
          <EventCard key={e.id} event={e} index={i} />
        ))}
      </div>
    </div>
  );
}
