import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact Us — RecessionPulse",
  description: "Report a problem, request a feature, or ask a question about RecessionPulse.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
          <p className="text-pulse-muted text-sm mb-8">
            Found a bug? Have a suggestion? We&apos;d love to hear from you.
          </p>
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
