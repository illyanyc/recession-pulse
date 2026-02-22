import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Sign Up — RecessionPulse",
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
