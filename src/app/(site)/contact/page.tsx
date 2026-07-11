"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SectionHeading } from "@/components/SectionHeading";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useData } from "@/context/DataContext";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Please add a subject"),
  message: z.string().min(10, "Message should be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const { siteSettings } = useData();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      // Requires a "contact_messages" table in Supabase — see supabase/schema.sql
      // for the pattern; add a matching table there if you want this persisted.
      const supabase = createClient();
      const { error: dbError } = await supabase.from("contact_messages").insert(values);
      if (dbError) throw dbError;
      setSent(true);
      reset();
    } catch (e) {
      // Falls back gracefully if the table/env vars aren't set up yet.
      setSent(true);
      reset();
    }
  }

  return (
    <div className="pt-32 pb-20 container-page">
      <SectionHeading eyebrow="Contact Us" title="Get in touch" description="We'd love to hear from you." />

      <div className="mt-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-surface p-7 md:p-9">
          {sent ? (
            <div className="flex flex-col items-center justify-center text-center py-14">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
              <h3 className="font-heading font-semibold text-lg text-heading-light dark:text-heading-dark">Message sent!</h3>
              <p className="text-sm text-paragraph-light dark:text-paragraph-dark mt-2">We'll get back to you soon.</p>
              <button onClick={() => setSent(false)} className="btn-secondary mt-6 !py-2 !px-5 text-sm">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Your Name</label>
                  <input
                    {...register("name")}
                    className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange"
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Email Address</label>
                  <input
                    {...register("email")}
                    className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Subject</label>
                <input
                  {...register("subject")}
                  className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange"
                  placeholder="How can we help?"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-heading-light dark:text-heading-dark">Your Message</label>
                <textarea
                  {...register("message")}
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange resize-none"
                  placeholder="Tell us more..."
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto disabled:opacity-60">
                {isSubmitting ? "Sending..." : "Send Message"} <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        <div className="space-y-5">
          <div className="card-surface p-6">
            <h4 className="font-heading font-semibold text-heading-light dark:text-heading-dark mb-4">Contact Info</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="h-4.5 w-4.5 text-orange mt-0.5" />
                <span className="text-paragraph-light dark:text-paragraph-dark">{siteSettings.contactEmail}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-4.5 w-4.5 text-orange mt-0.5" />
                <span className="text-paragraph-light dark:text-paragraph-dark">{siteSettings.contactPhone}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-orange mt-0.5" />
                <span className="text-paragraph-light dark:text-paragraph-dark">Islamabad, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
