"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Activity, Bell, Phone, Mail, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UserProfile } from "@/types";

function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  const national = digits.startsWith("1") && digits.length > 10 ? digits.slice(1) : digits;
  if (national.length <= 3) return `+1 (${national}`;
  if (national.length <= 6) return `+1 (${national.slice(0, 3)}) ${national.slice(3)}`;
  return `+1 (${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 10)}`;
}

function normalizePhoneE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export function SettingsContent() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setPhone(data.phone ? formatPhoneDisplay(data.phone) : "");
        setFullName(data.full_name || "");
        setSmsEnabled(data.sms_enabled);
        setEmailEnabled(data.email_alerts_enabled);
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setMessage("");

    const normalizedPhone = normalizePhoneE164(phone);
    const { error } = await supabase
      .from("profiles")
      .update({
        phone: normalizedPhone,
        full_name: fullName,
        sms_enabled: smsEnabled,
        email_alerts_enabled: emailEnabled,
      })
      .eq("id", profile.id);

    if (error) {
      setMessage("Failed to save settings");
    } else {
      setMessage("Settings saved successfully!");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Activity className="h-8 w-8 text-pulse-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pulse-darker">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-pulse-muted">Manage your alerts and profile</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-pulse-green" />
              Profile
            </h3>
            <div className="space-y-4">
              <Input
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
              <div>
                <label className="block text-sm font-medium text-pulse-text mb-1.5">Email</label>
                <div className="input-field bg-pulse-darker text-pulse-muted cursor-not-allowed">
                  {profile?.email}
                </div>
                <p className="text-xs text-pulse-muted mt-1">Email cannot be changed here</p>
              </div>
            </div>
          </Card>

          {/* Phone / SMS */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-pulse-green" />
              SMS Settings
            </h3>
            <div className="space-y-4">
              <Input
                label="Phone number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneDisplay(e.target.value))}
                placeholder="+1 (555) 000-0000"
              />
              <p className="text-xs text-pulse-muted">
                US numbers auto-formatted with +1. This number will receive daily SMS alerts.
              </p>

              <div className="flex items-center justify-between p-3 rounded-lg bg-pulse-dark border border-pulse-border">
                <div>
                  <p className="text-sm font-medium text-white">SMS alerts</p>
                  <p className="text-xs text-pulse-muted">Receive daily recession briefing via SMS</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    smsEnabled ? "bg-pulse-green" : "bg-pulse-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      smsEnabled ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Alert Preferences */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-pulse-green" />
              Alert Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-pulse-dark border border-pulse-border">
                <div>
                  <p className="text-sm font-medium text-white">Email alerts</p>
                  <p className="text-xs text-pulse-muted">Receive daily briefing via email</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    emailEnabled ? "bg-pulse-green" : "bg-pulse-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      emailEnabled ? "left-6" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-pulse-dark border border-pulse-border">
                <p className="text-sm font-medium text-white">Daily schedule</p>
                <p className="text-xs text-pulse-muted mt-1">
                  Alerts are sent every day at <span className="text-pulse-green font-medium">8:00 AM ET</span>. Data is refreshed from FRED and financial APIs at 6:00 AM ET.
                </p>
              </div>
            </div>
          </Card>

          {/* Save */}
          {message && (
            <div className={`p-3 rounded-lg ${message.includes("success") ? "bg-pulse-green/10 border border-pulse-green/20 text-pulse-green" : "bg-pulse-red/10 border border-pulse-red/20 text-pulse-red"}`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          <Button onClick={handleSave} loading={saving} size="lg" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save settings
          </Button>
        </div>
      </div>
    </div>
  );
}
