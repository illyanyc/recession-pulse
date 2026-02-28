import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Sign Up — RecessionPulse",
  description:
    "Create a free RecessionPulse account. Track 42 recession indicators in real time, get daily email briefings, and set up SMS alerts. No credit card required.",
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "Sign Up Free — RecessionPulse",
    description: "Create a free account to track 42 recession indicators in real time with daily alerts. No credit card required.",
    url: "https://recessionpulse.com/signup",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Sign Up for RecessionPulse" }],
  },
  alternates: { canonical: "https://recessionpulse.com/signup" },
};

export default function SignupPage() {
  return (
    <>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
      <Footer />
    </>
  );
}
