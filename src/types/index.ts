export type Role = "student" | "team" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  department: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type LessonType = "reading" | "video" | "lab";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  /** For "reading": plain text/markdown-ish content shown in-app.
   *  For "video": a video URL (YouTube/Vimeo embed link or direct mp4) played in-app.
   *  For "lab": step-by-step instructions solved in-app (checklist), not a downloadable file. */
  content: string;
  durationMinutes?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  status: "Active" | "Draft";
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  modules: number;
  icon: string;
  status: "Active" | "Draft";
  thumbnail?: string;
  category?: string;
  instructor?: string;
  durationHours?: number;
  certificateEnabled: boolean;
  /** Full course content — modules, lessons, and quizzes. Everything a
   * student sees inside a course lives here; there are no external links
   * (e.g. GitHub) required to view course content. Managed entirely from
   * Dashboard → Admin → Courses → Manage Content. */
  syllabus: CourseModule[];
}

export interface EventItem {
  id: string;
  title: string;
  type: "Workshop" | "Hackathon" | "Bootcamp" | "Seminar";
  date: string;
  mode: "Online" | "Onsite" | "Hybrid";
  description: string;
}

export type ResourceType =
  | "PDF"
  | "DOC"
  | "PPT"
  | "XLS"
  | "Image"
  | "Video"
  | "Audio"
  | "ZIP"
  | "Text"
  | "Markdown"
  | "Link";

export interface ResourceItem {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  size: string;
  /** A URL, or a data: URI when the file was uploaded directly. */
  url: string;
  thumbnail?: string;
  /** If set, this resource belongs to a specific course (and optionally a
   * specific module within it) and is only shown there — inside the
   * course's Learn page — rather than as a general public resource. */
  courseId?: string;
  moduleId?: string;
  visibility: "Enrolled Students" | "Public";
  downloadAllowed: boolean;
  previewAllowed: boolean;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
  views: number;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroDescription: string;
  contactEmail: string;
  contactPhone: string;
  statMembers: string;
  statEvents: string;
  statCertificates: string;
  statProjects: string;
}

export interface Certificate {
  id: string;
  course_title: string;
  issued_at: string;
  student_id: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "resource" | "course" | "certificate" | "event" | "review" | "system";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface StatCardData {
  label: string;
  value: string;
  icon: string;
}
