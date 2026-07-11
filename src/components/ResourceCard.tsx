"use client";

import { motion } from "framer-motion";
import { FileText, Video, Presentation, Image as ImageIcon, FileSpreadsheet, FileArchive, FileAudio, Link2, Download, Eye, LucideIcon } from "lucide-react";
import { ResourceItem, ResourceType } from "@/types";
import { useData } from "@/context/DataContext";

const iconMap: Record<ResourceType, LucideIcon> = {
  PDF: FileText,
  DOC: FileText,
  PPT: Presentation,
  XLS: FileSpreadsheet,
  Image: ImageIcon,
  Video: Video,
  Audio: FileAudio,
  ZIP: FileArchive,
  Text: FileText,
  Markdown: FileText,
  Link: Link2,
};

const colorMap: Record<ResourceType, string> = {
  PDF: "bg-red-500/10 text-red-500",
  DOC: "bg-skyblue/10 text-skyblue",
  PPT: "bg-orange/10 text-orange",
  XLS: "bg-emerald-500/10 text-emerald-500",
  Image: "bg-purple-500/10 text-purple-500",
  Video: "bg-skyblue/10 text-skyblue",
  Audio: "bg-pink-500/10 text-pink-500",
  ZIP: "bg-gray-500/10 text-gray-500",
  Text: "bg-gray-500/10 text-gray-500",
  Markdown: "bg-gray-500/10 text-gray-500",
  Link: "bg-navy/10 text-navy dark:text-white",
};

export function ResourceCard({ resource, index = 0 }: { resource: ResourceItem; index?: number }) {
  const Icon = iconMap[resource.type];
  const { trackResourceDownload } = useData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="card-surface hover-lift p-5 flex flex-col group"
    >
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${colorMap[resource.type]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-heading font-semibold text-sm text-heading-light dark:text-heading-dark line-clamp-2">
        {resource.title}
      </h4>
      {resource.description && (
        <p className="text-xs text-paragraph-light dark:text-paragraph-dark mt-1 line-clamp-2">{resource.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-paragraph-light dark:text-paragraph-dark mt-2 mb-4">
        <span>{resource.type}{resource.size ? ` · ${resource.size}` : ""}</span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-paragraph-light dark:text-paragraph-dark mb-3">
        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {resource.views}</span>
        <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" /> {resource.downloads}</span>
      </div>
      {resource.downloadAllowed !== false && (
        <a
          href={resource.url}
          download={resource.title}
          target={resource.url.startsWith("data:") ? undefined : "_blank"}
          rel="noreferrer"
          onClick={() => trackResourceDownload(resource.id)}
          className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-orange opacity-70 transition-all duration-300 group-hover:opacity-100"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </a>
      )}
    </motion.div>
  );
}
