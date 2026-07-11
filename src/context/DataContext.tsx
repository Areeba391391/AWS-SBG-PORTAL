"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import {
  Course,
  EventItem,
  ResourceItem,
  SiteSettings,
  CourseModule,
  Lesson,
  QuizQuestion,
  Review,
  Notification,
} from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface LearningPath {
  id: string;
  title: string;
  level: string;
  courses: number;
}

interface DataContextValue {
  courses: Course[];
  events: EventItem[];
  resources: ResourceItem[];
  learningPaths: LearningPath[];
  siteSettings: SiteSettings;
  reviews: Review[];
  notifications: Notification[];
  loading: boolean;

  addCourse: (c: Omit<Course, "id" | "syllabus" | "modules" | "certificateEnabled"> & { certificateEnabled?: boolean }) => Promise<void>;
  updateCourse: (id: string, c: Partial<Omit<Course, "id">>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  duplicateCourse: (id: string) => Promise<void>;

  addModule: (courseId: string, title: string) => Promise<void>;
  updateModule: (courseId: string, moduleId: string, data: Partial<Omit<CourseModule, "id" | "lessons" | "quiz">>) => Promise<void>;
  deleteModule: (courseId: string, moduleId: string) => Promise<void>;
  reorderModules: (courseId: string, orderedIds: string[]) => Promise<void>;

  addLesson: (courseId: string, moduleId: string, lesson: Omit<Lesson, "id">) => Promise<void>;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, lesson: Partial<Omit<Lesson, "id">>) => Promise<void>;
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) => Promise<void>;

  addQuizQuestion: (courseId: string, moduleId: string, q: Omit<QuizQuestion, "id">) => Promise<void>;
  updateQuizQuestion: (courseId: string, moduleId: string, questionId: string, q: Partial<Omit<QuizQuestion, "id">>) => Promise<void>;
  deleteQuizQuestion: (courseId: string, moduleId: string, questionId: string) => Promise<void>;

  addEvent: (e: Omit<EventItem, "id">) => Promise<void>;
  updateEvent: (id: string, e: Partial<Omit<EventItem, "id">>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  addResource: (r: Omit<ResourceItem, "id" | "downloads" | "views" | "uploadedAt">) => Promise<void>;
  updateResource: (id: string, r: Partial<Omit<ResourceItem, "id">>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  trackResourceView: (id: string) => Promise<void>;
  trackResourceDownload: (id: string) => Promise<void>;

  addLearningPath: (p: Omit<LearningPath, "id">) => Promise<void>;
  updateLearningPath: (id: string, p: Partial<Omit<LearningPath, "id">>) => Promise<void>;
  deleteLearningPath: (id: string) => Promise<void>;

  addReview: (r: Omit<Review, "id" | "createdAt">) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  hasReviewed: (courseId: string, userId: string) => boolean;

  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;

  updateSiteSettings: (s: Partial<SiteSettings>) => Promise<void>;

  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const defaultSiteSettings: SiteSettings = {
  heroTitle: "Learn AWS Cloud. Build. Innovate.",
  heroDescription: "A community of student builders growing their cloud computing skills.",
  contactEmail: "hello@awssbg.com",
  contactPhone: "",
  statMembers: "0",
  statEvents: "0",
  statCertificates: "0",
  statProjects: "0",
};

// ---------- row <-> app-type mapping ----------
function courseFromRow(row: any): Course {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    level: row.level,
    modules: row.modules ?? 0,
    icon: row.icon ?? "Cloud",
    status: row.status,
    thumbnail: row.thumbnail ?? undefined,
    category: row.category ?? undefined,
    instructor: row.instructor ?? undefined,
    durationHours: row.duration_hours ?? undefined,
    certificateEnabled: row.certificate_enabled ?? true,
    syllabus: row.syllabus ?? [],
  };
}

function eventFromRow(row: any): EventItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    date: row.event_date,
    mode: row.mode,
    description: row.description ?? "",
  };
}

function resourceFromRow(row: any): ResourceItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type,
    size: row.size_label ?? "",
    url: row.file_url ?? "",
    thumbnail: row.thumbnail ?? undefined,
    courseId: row.course_id ?? undefined,
    moduleId: row.module_id ?? undefined,
    visibility: row.visibility,
    downloadAllowed: row.download_allowed,
    previewAllowed: row.preview_allowed,
    uploadedBy: row.uploaded_by ?? "",
    uploadedAt: row.created_at,
    downloads: row.downloads ?? 0,
    views: row.views ?? 0,
  };
}

function reviewFromRow(row: any): Review {
  return {
    id: row.id,
    courseId: row.course_id,
    userId: row.student_id,
    userName: row.user_name,
    rating: row.rating,
    comment: row.comment ?? "",
    createdAt: row.created_at,
  };
}

function notificationFromRow(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.message ?? "",
    type: row.type,
    read: row.is_read,
    createdAt: row.created_at,
    link: row.link ?? undefined,
  };
}

function siteSettingsFromRow(row: any): SiteSettings {
  return {
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    contactEmail: row.contact_email ?? "",
    contactPhone: row.contact_phone ?? "",
    statMembers: row.stat_members ?? "0",
    statEvents: row.stat_events ?? "0",
    statCertificates: row.stat_certificates ?? "0",
    statProjects: row.stat_projects ?? "0",
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [learningPathRows, setLearningPathRows] = useState<LearningPath[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const learningPaths: LearningPath[] = learningPathRows;

  const refreshCourses = useCallback(async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (data) setCourses(data.map(courseFromRow));
  }, [supabase]);

  const refreshEvents = useCallback(async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    if (data) setEvents(data.map(eventFromRow));
  }, [supabase]);

  const refreshResources = useCallback(async () => {
    const { data } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
    if (data) setResources(data.map(resourceFromRow));
  }, [supabase]);

  const refreshLearningPaths = useCallback(async () => {
    const { data } = await supabase.from("learning_paths").select("*").order("created_at", { ascending: true });
    if (data) setLearningPathRows(data as any);
  }, [supabase]);

  const refreshReviews = useCallback(async () => {
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (data) setReviews(data.map(reviewFromRow));
  }, [supabase]);

  const refreshSiteSettings = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("id", true).single();
    if (data) setSiteSettings(siteSettingsFromRow(data));
  }, [supabase]);

  const refreshNotifications = useCallback(async () => {
    if (!userRef.current) {
      setNotifications([]);
      return;
    }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userRef.current.id)
      .order("created_at", { ascending: false });
    if (data) setNotifications(data.map(notificationFromRow));
  }, [supabase]);

  const refresh = useCallback(async () => {
    await Promise.all([
      refreshCourses(),
      refreshEvents(),
      refreshResources(),
      refreshLearningPaths(),
      refreshReviews(),
      refreshSiteSettings(),
      refreshNotifications(),
    ]);
  }, [refreshCourses, refreshEvents, refreshResources, refreshLearningPaths, refreshReviews, refreshSiteSettings, refreshNotifications]);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-load notifications whenever who's logged in changes, and keep them
  // live via Supabase Realtime — this is what makes the reminder job (which
  // inserts rows from inside Postgres on a schedule) show up in the bell
  // icon without the user needing to refresh the page.
  useEffect(() => {
    refreshNotifications();
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => refreshNotifications()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ---- helper: mutate a course's nested syllabus JSONB and persist ----
  async function persistCourse(courseId: string, mutate: (c: Course) => Course) {
    const current = courses.find((c) => c.id === courseId);
    if (!current) return;
    const next = mutate(current);
    const { error } = await supabase
      .from("courses")
      .update({ syllabus: next.syllabus, modules: next.syllabus.length })
      .eq("id", courseId);
    if (error) {
      console.error("Failed to save course:", error.message);
      alert(`Couldn't save: ${error.message}`);
      return;
    }
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...next, modules: next.syllabus.length } : c)));
  }

  function withCourseModule(course: Course, moduleId: string, mutate: (m: CourseModule) => CourseModule): Course {
    return { ...course, syllabus: course.syllabus.map((m) => (m.id === moduleId ? mutate(m) : m)) };
  }

  const value: DataContextValue = {
    courses,
    events,
    resources,
    learningPaths,
    siteSettings,
    reviews,
    notifications,
    loading,
    refresh,

    addCourse: async (c) => {
      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: c.title,
          description: c.description,
          level: c.level,
          icon: c.icon,
          status: c.status,
          thumbnail: c.thumbnail,
          category: c.category,
          instructor: c.instructor,
          duration_hours: c.durationHours,
          certificate_enabled: c.certificateEnabled ?? true,
          modules: 0,
          syllabus: [],
        })
        .select()
        .single();
      if (error) {
        console.error("Failed to add course:", error.message);
        alert(`Couldn't add course: ${error.message}`);
        return;
      }
      if (data) setCourses((prev) => [courseFromRow(data), ...prev]);
    },
    updateCourse: async (id, c) => {
      const patch: Record<string, unknown> = {};
      if (c.title !== undefined) patch.title = c.title;
      if (c.description !== undefined) patch.description = c.description;
      if (c.level !== undefined) patch.level = c.level;
      if (c.icon !== undefined) patch.icon = c.icon;
      if (c.status !== undefined) patch.status = c.status;
      if (c.thumbnail !== undefined) patch.thumbnail = c.thumbnail;
      if (c.category !== undefined) patch.category = c.category;
      if (c.instructor !== undefined) patch.instructor = c.instructor;
      if (c.durationHours !== undefined) patch.duration_hours = c.durationHours;
      if (c.certificateEnabled !== undefined) patch.certificate_enabled = c.certificateEnabled;
      await supabase.from("courses").update(patch).eq("id", id);
      setCourses((prev) => prev.map((x) => (x.id === id ? { ...x, ...c } : x)));
    },
    deleteCourse: async (id) => {
      await supabase.from("courses").delete().eq("id", id);
      setCourses((prev) => prev.filter((x) => x.id !== id));
      setResources((prev) => prev.filter((r) => r.courseId !== id));
      setReviews((prev) => prev.filter((r) => r.courseId !== id));
    },
    duplicateCourse: async (id) => {
      const original = courses.find((c) => c.id === id);
      if (!original) return;
      const { data } = await supabase
        .from("courses")
        .insert({
          title: `${original.title} (Copy)`,
          description: original.description,
          level: original.level,
          icon: original.icon,
          status: "Draft",
          thumbnail: original.thumbnail,
          category: original.category,
          instructor: original.instructor,
          duration_hours: original.durationHours,
          certificate_enabled: original.certificateEnabled,
          modules: original.syllabus.length,
          syllabus: original.syllabus,
        })
        .select()
        .single();
      if (!data) return;
      const newCourse = courseFromRow(data);
      setCourses((prev) => [newCourse, ...prev]);

      const toCopy = resources.filter((r) => r.courseId === id);
      if (toCopy.length > 0) {
        const { data: copied } = await supabase
          .from("resources")
          .insert(
            toCopy.map((r) => ({
              title: r.title,
              description: r.description,
              type: r.type,
              file_url: r.url,
              size_label: r.size,
              thumbnail: r.thumbnail,
              course_id: newCourse.id,
              module_id: r.moduleId,
              visibility: r.visibility,
              download_allowed: r.downloadAllowed,
              preview_allowed: r.previewAllowed,
              uploaded_by: r.uploadedBy,
            }))
          )
          .select();
        if (copied) setResources((prev) => [...copied.map(resourceFromRow), ...prev]);
      }
    },

    addModule: (courseId, title) =>
      persistCourse(courseId, (c) => ({
        ...c,
        syllabus: [
          ...c.syllabus,
          { id: `m_${Date.now()}`, title, order: c.syllabus.length + 1, status: "Active", lessons: [], quiz: [] },
        ],
      })),
    updateModule: (courseId, moduleId, data) =>
      persistCourse(courseId, (c) => withCourseModule(c, moduleId, (m) => ({ ...m, ...data }))),
    deleteModule: (courseId, moduleId) =>
      persistCourse(courseId, (c) => ({ ...c, syllabus: c.syllabus.filter((m) => m.id !== moduleId) })),
    reorderModules: (courseId, orderedIds) =>
      persistCourse(courseId, (c) => ({
        ...c,
        syllabus: orderedIds
          .map((id, i) => {
            const m = c.syllabus.find((mm) => mm.id === id);
            return m ? { ...m, order: i + 1 } : null;
          })
          .filter((m): m is CourseModule => Boolean(m)),
      })),

    addLesson: (courseId, moduleId, lesson) =>
      persistCourse(courseId, (c) =>
        withCourseModule(c, moduleId, (m) => ({ ...m, lessons: [...m.lessons, { ...lesson, id: `l_${Date.now()}` }] }))
      ),
    updateLesson: (courseId, moduleId, lessonId, lesson) =>
      persistCourse(courseId, (c) =>
        withCourseModule(c, moduleId, (m) => ({
          ...m,
          lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...lesson } : l)),
        }))
      ),
    deleteLesson: (courseId, moduleId, lessonId) =>
      persistCourse(courseId, (c) =>
        withCourseModule(c, moduleId, (m) => ({ ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }))
      ),

    addQuizQuestion: (courseId, moduleId, q) =>
      persistCourse(courseId, (c) =>
        withCourseModule(c, moduleId, (m) => ({ ...m, quiz: [...m.quiz, { ...q, id: `q_${Date.now()}` }] }))
      ),
    updateQuizQuestion: (courseId, moduleId, questionId, q) =>
      persistCourse(courseId, (c) =>
        withCourseModule(c, moduleId, (m) => ({
          ...m,
          quiz: m.quiz.map((x) => (x.id === questionId ? { ...x, ...q } : x)),
        }))
      ),
    deleteQuizQuestion: (courseId, moduleId, questionId) =>
      persistCourse(courseId, (c) =>
        withCourseModule(c, moduleId, (m) => ({ ...m, quiz: m.quiz.filter((x) => x.id !== questionId) }))
      ),

    addEvent: async (e) => {
      const { data, error } = await supabase
        .from("events")
        .insert({ title: e.title, type: e.type, event_date: e.date, mode: e.mode, description: e.description })
        .select()
        .single();
      if (error) {
        console.error("Failed to add event:", error.message);
        alert(`Couldn't add event: ${error.message}`);
        return;
      }
      if (data) setEvents((prev) => [...prev, eventFromRow(data)].sort((a, b) => a.date.localeCompare(b.date)));
    },
    updateEvent: async (id, e) => {
      const patch: Record<string, unknown> = {};
      if (e.title !== undefined) patch.title = e.title;
      if (e.type !== undefined) patch.type = e.type;
      if (e.date !== undefined) patch.event_date = e.date;
      if (e.mode !== undefined) patch.mode = e.mode;
      if (e.description !== undefined) patch.description = e.description;
      await supabase.from("events").update(patch).eq("id", id);
      setEvents((prev) => prev.map((x) => (x.id === id ? { ...x, ...e } : x)));
    },
    deleteEvent: async (id) => {
      await supabase.from("events").delete().eq("id", id);
      setEvents((prev) => prev.filter((x) => x.id !== id));
    },

    addResource: async (r) => {
      const { data, error } = await supabase
        .from("resources")
        .insert({
          title: r.title,
          description: r.description,
          type: r.type,
          file_url: r.url,
          size_label: r.size,
          thumbnail: r.thumbnail,
          course_id: r.courseId,
          module_id: r.moduleId,
          visibility: r.visibility,
          download_allowed: r.downloadAllowed,
          preview_allowed: r.previewAllowed,
          uploaded_by: r.uploadedBy,
        })
        .select()
        .single();
      if (error) {
        console.error("Failed to add resource:", error.message);
        alert(`Couldn't add resource: ${error.message}`);
        return;
      }
      if (data) setResources((prev) => [resourceFromRow(data), ...prev]);
    },
    updateResource: async (id, r) => {
      const patch: Record<string, unknown> = {};
      if (r.title !== undefined) patch.title = r.title;
      if (r.description !== undefined) patch.description = r.description;
      if (r.type !== undefined) patch.type = r.type;
      if (r.url !== undefined) patch.file_url = r.url;
      if (r.size !== undefined) patch.size_label = r.size;
      if (r.visibility !== undefined) patch.visibility = r.visibility;
      if (r.downloadAllowed !== undefined) patch.download_allowed = r.downloadAllowed;
      if (r.previewAllowed !== undefined) patch.preview_allowed = r.previewAllowed;
      await supabase.from("resources").update(patch).eq("id", id);
      setResources((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x)));
    },
    deleteResource: async (id) => {
      await supabase.from("resources").delete().eq("id", id);
      setResources((prev) => prev.filter((x) => x.id !== id));
    },
    trackResourceView: async (id) => {
      setResources((prev) => prev.map((x) => (x.id === id ? { ...x, views: x.views + 1 } : x)));
      const current = resources.find((x) => x.id === id);
      if (current) await supabase.from("resources").update({ views: current.views + 1 }).eq("id", id);
    },
    trackResourceDownload: async (id) => {
      setResources((prev) => prev.map((x) => (x.id === id ? { ...x, downloads: x.downloads + 1 } : x)));
      const current = resources.find((x) => x.id === id);
      if (current) await supabase.from("resources").update({ downloads: current.downloads + 1 }).eq("id", id);
    },

    addLearningPath: async (p) => {
      const { data, error } = await supabase
        .from("learning_paths")
        .insert({ title: p.title, level: p.level, courses: p.courses ?? 0 })
        .select()
        .single();
      if (error) {
        console.error("Failed to add learning path:", error.message);
        alert(`Couldn't add learning path: ${error.message}`);
        return;
      }
      if (data) setLearningPathRows((prev) => [...prev, data as any]);
    },
    updateLearningPath: async (id, p) => {
      await supabase.from("learning_paths").update(p).eq("id", id);
      setLearningPathRows((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
    },
    deleteLearningPath: async (id) => {
      await supabase.from("learning_paths").delete().eq("id", id);
      setLearningPathRows((prev) => prev.filter((x) => x.id !== id));
    },

    addReview: async (r) => {
      const { data } = await supabase
        .from("reviews")
        .insert({ course_id: r.courseId, student_id: r.userId, user_name: r.userName, rating: r.rating, comment: r.comment })
        .select()
        .single();
      if (data) setReviews((prev) => [reviewFromRow(data), ...prev]);
    },
    deleteReview: async (id) => {
      await supabase.from("reviews").delete().eq("id", id);
      setReviews((prev) => prev.filter((x) => x.id !== id));
    },
    hasReviewed: (courseId, userId) => reviews.some((r) => r.courseId === courseId && r.userId === userId),

    addNotification: async (n) => {
      const { data } = await supabase
        .from("notifications")
        .insert({ user_id: n.userId, title: n.title, message: n.body, type: n.type, link: n.link })
        .select()
        .single();
      if (data && n.userId === userRef.current?.id) setNotifications((prev) => [notificationFromRow(data), ...prev]);
    },
    markNotificationRead: async (id) => {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    markAllNotificationsRead: async (userId) => {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
      setNotifications((prev) => prev.map((n) => (n.userId === userId ? { ...n, read: true } : n)));
    },

    updateSiteSettings: async (settings) => {
      const patch: Record<string, unknown> = {};
      if (settings.heroTitle !== undefined) patch.hero_title = settings.heroTitle;
      if (settings.heroDescription !== undefined) patch.hero_description = settings.heroDescription;
      if (settings.contactEmail !== undefined) patch.contact_email = settings.contactEmail;
      if (settings.contactPhone !== undefined) patch.contact_phone = settings.contactPhone;
      if (settings.statMembers !== undefined) patch.stat_members = settings.statMembers;
      if (settings.statEvents !== undefined) patch.stat_events = settings.statEvents;
      if (settings.statCertificates !== undefined) patch.stat_certificates = settings.statCertificates;
      if (settings.statProjects !== undefined) patch.stat_projects = settings.statProjects;
      await supabase.from("site_settings").update(patch).eq("id", true);
      setSiteSettings((prev) => ({ ...prev, ...settings }));
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
