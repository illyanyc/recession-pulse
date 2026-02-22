"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Activity, Bell, Phone, Mail, Clock, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UserProfile } from "@/types";

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
  const [alertTime, setAlertTime] = useState("08:00");
  const [timezone, setTimezone] = useState("America/New_York");

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
        setPhone(data.phone || "");
        setFullName(data.full_name || "");
        setSmsEnabled(data.sms_enabled);
        setEmailEnabled(data.email_alerts_enabled);
        setAlertTime(data.preferred_alert_time || "08:00");
        setTimezone(data.timezone || "America/New_York");
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        phone,
        full_name: fullName,
        sms_enabled: smsEnabled,
        email_alerts_enabled: emailEnabled,
        preferred_alert_time: alertTime,
        timezone,
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
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
              <p className="text-xs text-pulse-muted">
                Include country code. This number will receive daily SMS alerts.
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pulse-text mb-1.5">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Alert time
                  </label>
                  <select
                    value={alertTime}
                    onChange={(e) => setAlertTime(e.target.value)}
                    className="input-field"
                  >
                    <option value="06:00">6:00 AM</option>
                    <option value="07:00">7:00 AM</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-pulse-text mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="input-field"
                  >
                    <option value="America/New_York">Eastern (ET)</option>
                    <option value="America/Chicago">Central (CT)</option>
                    <option value="America/Denver">Mountain (MT)</option>
                    <option value="America/Los_Angeles">Pacific (PT)</option>
                  </select>
                </div>
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
