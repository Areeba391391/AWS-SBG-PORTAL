"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { StoredEventRegistration } from "@/lib/crossUserStores";

interface EventRegistrationContextValue {
  loading: boolean;
  isRegistered: (eventId: string) => boolean;
  register: (eventId: string) => Promise<void>;
  unregister: (eventId: string) => Promise<void>;
  myRegistrations: () => StoredEventRegistration[];
}

const EventRegistrationContext = createContext<EventRegistrationContextValue | null>(null);

export function EventRegistrationProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const { user } = useAuth();
  const [mine, setMine] = useState<StoredEventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setMine([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("event_registrations").select("*").eq("student_id", user.id);
    setMine((data ?? []).map((r: any) => ({ eventId: r.event_id, registeredAt: r.registered_at })));
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isRegistered(eventId: string) {
    return mine.some((r) => r.eventId === eventId);
  }

  async function register(eventId: string) {
    if (!user || isRegistered(eventId)) return;
    const { data } = await supabase
      .from("event_registrations")
      .insert({ event_id: eventId, student_id: user.id })
      .select()
      .single();
    if (data) setMine((list) => [...list, { eventId, registeredAt: data.registered_at }]);
  }

  async function unregister(eventId: string) {
    if (!user) return;
    await supabase.from("event_registrations").delete().eq("event_id", eventId).eq("student_id", user.id);
    setMine((list) => list.filter((r) => r.eventId !== eventId));
  }

  return (
    <EventRegistrationContext.Provider value={{ loading, isRegistered, register, unregister, myRegistrations: () => mine }}>
      {children}
    </EventRegistrationContext.Provider>
  );
}

export function useEventRegistration() {
  const ctx = useContext(EventRegistrationContext);
  if (!ctx) throw new Error("useEventRegistration must be used within EventRegistrationProvider");
  return ctx;
}
