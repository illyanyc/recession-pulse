import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Indicators } from "@/components/landing/Indicators";
import { SMSPreview } from "@/components/landing/SMSPreview";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Indicators />
        <SMSPreview />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
