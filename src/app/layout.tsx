import type { Metadata } from "next";
import { Poppins, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { EnrollmentProvider } from "@/context/EnrollmentContext";
import { EventRegistrationProvider } from "@/context/EventRegistrationContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AWS SBG | AWS Student Builders Group",
  description:
    "Learn AWS Cloud. Build. Learn. Innovate Together — a community of student builders growing their cloud computing skills.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${inter.variable} ${manrope.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <EnrollmentProvider>
                <EventRegistrationProvider>{children}</EventRegistrationProvider>
              </EnrollmentProvider>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
