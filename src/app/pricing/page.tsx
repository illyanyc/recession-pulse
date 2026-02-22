import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Pricing — RecessionPulse",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
