import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Sign In — RecessionPulse",
  description:
    "Sign in to your RecessionPulse account to access 42 real-time recession indicators, daily alerts, and your personalized dashboard.",
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "Sign In — RecessionPulse",
    description: "Sign in to access your RecessionPulse dashboard with 42 real-time recession indicators and daily alerts.",
    url: "https://recessionpulse.com/login",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Sign In to RecessionPulse" }],
  },
  alternates: { canonical: "https://recessionpulse.com/login" },
};

export default function LoginPage() {
  return (
    <>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
      <Footer />
    </>
  );
}
