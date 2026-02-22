import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Sign In — RecessionPulse",
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
