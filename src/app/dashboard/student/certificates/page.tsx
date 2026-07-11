"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Eye } from "lucide-react";
import { Modal } from "@/components/Modal";
import { CertificateSheet } from "@/components/CertificateSheet";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { useEnrollment } from "@/context/EnrollmentContext";

export default function StudentCertificatesPage() {
  const { courses } = useData();
  const { user } = useAuth();
  const { myEnrollments } = useEnrollment();
  const [viewing, setViewing] = useState<string | null>(null);

  const earned = myEnrollments()
    .filter((e) => e.certificateIssued)
    .map((e) => ({ enrollment: e, course: courses.find((c) => c.id === e.courseId) }))
    .filter((x): x is { enrollment: typeof x.enrollment; course: NonNullable<typeof x.course> } => Boolean(x.course));

  const viewingCourse = earned.find((e) => e.course.id === viewing);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-heading-light dark:text-heading-dark">Certificates</h1>
        <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-1">
          Certificates you've earned by completing courses — issued automatically the moment you finish every lesson and pass every quiz.
        </p>
      </div>

      {earned.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <Award className="h-9 w-9 text-orange mx-auto mb-3" />
          <p className="text-sm text-paragraph-light dark:text-paragraph-dark">
            No certificates yet — finish a course's lessons and quizzes to earn one.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {earned.map(({ enrollment, course }, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card-surface hover-lift p-6 relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange/10" />
              <Award className="h-9 w-9 text-orange relative" />
              <h3 className="mt-4 font-heading font-semibold text-heading-light dark:text-heading-dark relative">
                {course.title}
              </h3>
              <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-1 relative">
                Issued {enrollment.certificateIssuedAt ? new Date(enrollment.certificateIssuedAt).toLocaleDateString() : ""}
              </p>
              {enrollment.certificateNumber && (
                <p className="text-[11px] text-paragraph-light dark:text-paragraph-dark mt-0.5 font-mono relative">{enrollment.certificateNumber}</p>
              )}
              <button onClick={() => setViewing(course.id)} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-orange relative">
                <Eye className="h-3.5 w-3.5" /> View Certificate
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={Boolean(viewingCourse)} onClose={() => setViewing(null)} title="Certificate">
        {viewingCourse && user && (
          <div className="space-y-4">
            <div id="certificate-print-area">
              <CertificateSheet
                studentName={user.fullName}
                courseTitle={viewingCourse.course.title}
                instructor={viewingCourse.course.instructor}
                issuedAt={viewingCourse.enrollment.certificateIssuedAt ?? new Date().toISOString()}
                certificateNumber={viewingCourse.enrollment.certificateNumber ?? "N/A"}
              />
            </div>
            <button onClick={() => window.print()} className="btn-primary w-full justify-center">
              Print / Save as PDF
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
