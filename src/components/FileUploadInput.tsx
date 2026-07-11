"use client";

import { useRef, useState } from "react";
import { UploadCloud, Link as LinkIcon } from "lucide-react";
import { ResourceType } from "@/types";
import { createClient } from "@/lib/supabase/client";

function humanFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

const extensionMap: Record<string, ResourceType> = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOC",
  ppt: "PPT",
  pptx: "PPT",
  xls: "XLS",
  xlsx: "XLS",
  csv: "XLS",
  jpg: "Image",
  jpeg: "Image",
  png: "Image",
  svg: "Image",
  webp: "Image",
  gif: "Image",
  mp4: "Video",
  mov: "Video",
  avi: "Video",
  webm: "Video",
  mp3: "Audio",
  wav: "Audio",
  zip: "ZIP",
  rar: "ZIP",
  txt: "Text",
  md: "Markdown",
};

export function detectResourceType(fileName: string): ResourceType {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return extensionMap[ext] ?? "PDF";
}

interface Props {
  onFile: (data: { title: string; url: string; size: string; type: ResourceType }) => void;
  accept?: string;
}

/** Lets an admin/team member either upload a real file — stored in the
 * project's Supabase Storage 'resources' bucket, so it's a real hosted file
 * with a real public URL — or paste a URL instead. Either way the resource
 * becomes downloadable inside the app, and its type (PDF/DOC/PPT/XLS/Image/
 * Video/Audio/ZIP/Text/Markdown) is auto-detected from the file extension. */
export function FileUploadInput({ onFile, accept }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlValue, setUrlValue] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const supabase = createClient();
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("resources").upload(path, file, { cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from("resources").getPublicUrl(path);
      onFile({
        title: file.name,
        url: data.publicUrl,
        size: humanFileSize(file.size),
        type: detectResourceType(file.name),
      });
      setFileName(file.name);
    } catch (err) {
      console.error("Upload failed:", err);
      setFileName(null);
      alert("Upload failed. Make sure the 'resources' storage bucket exists in Supabase (see supabase/schema.sql) and that you're signed in as a team/admin account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${mode === "upload" ? "bg-orange text-white" : "bg-bg-light dark:bg-white/10 text-paragraph-light dark:text-paragraph-dark"}`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${mode === "url" ? "bg-orange text-white" : "bg-bg-light dark:bg-white/10 text-paragraph-light dark:text-paragraph-dark"}`}
        >
          Paste URL / Link
        </button>
      </div>

      {mode === "upload" ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-border-light dark:border-border-dark px-4 py-4 text-sm text-paragraph-light dark:text-paragraph-dark hover:border-orange transition-colors"
        >
          <UploadCloud className="h-5 w-5 text-orange flex-shrink-0" />
          {busy ? "Uploading..." : fileName ? `Selected: ${fileName}` : "Click to choose a PDF, DOC, PPT, XLS, image, video, audio, ZIP, text, or markdown file"}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-paragraph-light dark:text-paragraph-dark flex-shrink-0" />
          <input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onBlur={() =>
              urlValue.trim() &&
              onFile({ title: urlValue.split("/").pop() || "Resource", url: urlValue.trim(), size: "", type: "Link" })
            }
            placeholder="https://..."
            className="flex-1 rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-orange"
          />
        </div>
      )}
    </div>
  );
}
