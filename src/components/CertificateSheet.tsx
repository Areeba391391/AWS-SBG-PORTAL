"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Award } from "lucide-react";

export function CertificateSheet({
  studentName,
  courseTitle,
  instructor,
  issuedAt,
  certificateNumber,
}: {
  studentName: string;
  courseTitle: string;
  instructor?: string;
  issuedAt: string;
  certificateNumber: string;
}) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayload = `AWS SBG Certificate\nNumber: ${certificateNumber}\nStudent: ${studentName}\nCourse: ${courseTitle}\nIssued: ${new Date(issuedAt).toLocaleDateString()}`;
    QRCode.toDataURL(verifyPayload, { margin: 1, width: 140 }).then(setQr).catch(() => setQr(null));
  }, [certificateNumber, studentName, courseTitle, issuedAt]);

  return (
    <div className="certificate-sheet bg-white rounded-2xl border-8 border-orange p-10 text-center relative overflow-hidden">
      <div className="absolute inset-4 border-2 border-navy/20 rounded-xl pointer-events-none" />
      <p className="text-xs tracking-[0.3em] text-navy font-semibold uppercase">AWS Student Builders Group</p>
      <h1 className="mt-6 text-3xl font-bold text-navy">Certificate of Completion</h1>
      <p className="mt-6 text-sm text-gray-500">This certifies that</p>
      <p className="mt-2 text-2xl font-heading font-bold text-orange">{studentName}</p>
      <p className="mt-4 text-sm text-gray-500">has successfully completed</p>
      <p className="mt-2 text-xl font-semibold text-navy">{courseTitle}</p>
      {instructor && <p className="mt-1 text-xs text-gray-400">Instructor: {instructor}</p>}

      <div className="mt-10 flex items-end justify-between px-4">
        <div className="text-left">
          <p className="text-xs text-gray-400">Issued On</p>
          <p className="text-sm font-medium text-navy">{new Date(issuedAt).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}</p>
          <p className="text-xs text-gray-400 mt-3">Certificate No.</p>
          <p className="text-sm font-medium text-navy font-mono">{certificateNumber}</p>
        </div>
        <div className="flex flex-col items-center">
          {qr && <img src={qr} alt="Verification QR code" className="h-20 w-20" />}
          <p className="text-[10px] text-gray-400 mt-1">Scan to verify</p>
        </div>
        <div className="text-right">
          <Award className="h-10 w-10 text-orange ml-auto" />
          <p className="text-xs text-gray-400 mt-1">AWS SBG</p>
        </div>
      </div>
    </div>
  );
}
