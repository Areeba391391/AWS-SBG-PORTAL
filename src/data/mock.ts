import { Course, EventItem, ResourceItem, SiteSettings } from "@/types";

// ---------------------------------------------------------------------
// SAMPLE DATA ONLY — everything below is a starting example so the app is
// testable out of the box. Replace it from inside the app itself:
//   • Courses, modules, lessons, quizzes, resources → Dashboard → Admin → Courses
//   • Events                              → Dashboard → Admin → Events
//   • Homepage text / contact info        → Dashboard → Admin → Website CMS
// See CONTENT-GUIDE.md in the project root for a full walkthrough.
// ---------------------------------------------------------------------

export const courses: Course[] = [
  {
    id: "c1",
    title: "AWS Cloud Practitioner",
    description: "Start your AWS journey with core cloud concepts.",
    level: "Beginner",
    modules: 1,
    icon: "Cloud",
    status: "Active",
    category: "Cloud Fundamentals",
    instructor: "AWS SBG Faculty",
    durationHours: 6,
    certificateEnabled: true,
    syllabus: [
      {
        id: "c1-m1",
        title: "Sample Module — Introduction to Cloud Computing",
        order: 1,
        status: "Active",
        lessons: [
          {
            id: "c1-m1-l1",
            title: "What is Cloud Computing? (sample reading)",
            type: "reading",
            content:
              "This is placeholder lesson text. Replace it from Admin → Courses → Manage Content with your real lesson content. Reading lessons support plain paragraphs.",
            durationMinutes: 5,
          },
          {
            id: "c1-m1-l2",
            title: "AWS Global Infrastructure (sample video)",
            type: "video",
            content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            durationMinutes: 8,
          },
          {
            id: "c1-m1-l3",
            title: "Launch your first EC2 instance (sample lab)",
            type: "lab",
            content:
              "Step 1: Open the AWS console.\nStep 2: Navigate to EC2.\nStep 3: Launch a t2.micro instance.\nStep 4: Connect and confirm it is running.",
            durationMinutes: 20,
          },
        ],
        quiz: [
          {
            id: "c1-m1-q1",
            question: "Which AWS service provides virtual servers?",
            options: ["S3", "EC2", "Route 53", "IAM"],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    title: "AWS Developer",
    description: "Learn to build and deploy applications on AWS.",
    level: "Intermediate",
    modules: 1,
    icon: "Code2",
    status: "Active",
    category: "Development",
    instructor: "AWS SBG Faculty",
    durationHours: 10,
    certificateEnabled: true,
    syllabus: [
      {
        id: "c2-m1",
        title: "Sample Module — AWS SDK & CLI Fundamentals",
        order: 1,
        status: "Active",
        lessons: [
          {
            id: "c2-m1-l1",
            title: "Setting up the AWS CLI (sample reading)",
            type: "reading",
            content: "Placeholder lesson text — replace from Admin → Courses → Manage Content.",
            durationMinutes: 6,
          },
        ],
        quiz: [
          {
            id: "c2-m1-q1",
            question: "Which command configures your AWS CLI credentials?",
            options: ["aws configure", "aws init", "aws setup", "aws login"],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: "c3",
    title: "Machine Learning on AWS",
    description: "Build ML models and applications using AWS services.",
    level: "Advanced",
    modules: 1,
    icon: "BrainCircuit",
    status: "Active",
    category: "Machine Learning",
    instructor: "AWS SBG Faculty",
    durationHours: 12,
    certificateEnabled: true,
    syllabus: [
      {
        id: "c3-m1",
        title: "Sample Module — Machine Learning Foundations",
        order: 1,
        status: "Active",
        lessons: [
          {
            id: "c3-m1-l1",
            title: "Intro to SageMaker (sample reading)",
            type: "reading",
            content: "Placeholder lesson text — replace from Admin → Courses → Manage Content.",
            durationMinutes: 7,
          },
        ],
        quiz: [
          {
            id: "c3-m1-q1",
            question: "Which AWS service is used to build, train, and deploy ML models?",
            options: ["SageMaker", "Lambda", "CloudFront", "Aurora"],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: "c4",
    title: "AWS Security",
    description: "Secure your applications and infrastructure on AWS.",
    level: "Intermediate",
    modules: 1,
    icon: "ShieldCheck",
    status: "Active",
    category: "Security",
    instructor: "AWS SBG Faculty",
    durationHours: 8,
    certificateEnabled: true,
    syllabus: [
      {
        id: "c4-m1",
        title: "Sample Module — Shared Responsibility Model",
        order: 1,
        status: "Active",
        lessons: [
          {
            id: "c4-m1-l1",
            title: "AWS vs. Customer responsibilities (sample reading)",
            type: "reading",
            content: "Placeholder lesson text — replace from Admin → Courses → Manage Content.",
            durationMinutes: 6,
          },
        ],
        quiz: [
          {
            id: "c4-m1-q1",
            question: "Who is responsible for patching the underlying EC2 hypervisor?",
            options: ["The customer", "AWS", "Both equally", "No one"],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
];

export const events: EventItem[] = [
  {
    id: "e1",
    title: "AWS Cloud Workshop",
    type: "Workshop",
    date: "2026-07-20",
    mode: "Online",
    description: "Hands-on workshop on AWS core services.",
  },
  {
    id: "e2",
    title: "AWS Build Hackathon",
    type: "Hackathon",
    date: "2026-08-12",
    mode: "Hybrid",
    description: "Build innovative solutions with AWS.",
  },
  {
    id: "e3",
    title: "AWS Bootcamp",
    type: "Bootcamp",
    date: "2026-09-10",
    mode: "Online",
    description: "3-day intensive bootcamp on cloud fundamentals.",
  },
];

export const resources: ResourceItem[] = [];

export const siteSettings: SiteSettings = {
  heroTitle: "Learn AWS Cloud. Build. Learn. Innovate Together.",
  heroDescription:
    "Join a community of student builders shaping the future of cloud computing — hands-on labs, live workshops, and real projects.",
  contactEmail: "hello@awssbg.com",
  contactPhone: "+92 300 1234567",
  statMembers: "0",
  statEvents: "0",
  statCertificates: "0",
  statProjects: "0",
};
