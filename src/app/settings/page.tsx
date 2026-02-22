import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsContent } from "./SettingsContent";

export const metadata = {
  title: "Settings — RecessionPulse",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SettingsContent />;
}
