import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — RecessionPulse",
  description:
    "Get in touch with the RecessionPulse team. Report bugs, request features, ask questions about recession indicators, or get help with your subscription.",
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "Contact Us — RecessionPulse",
    description:
      "Get in touch with the RecessionPulse team. Report bugs, request features, or ask questions about recession indicators.",
    url: "https://recessionpulse.com/contact",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact RecessionPulse" }],
  },
  alternates: { canonical: "https://recessionpulse.com/contact" },
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
