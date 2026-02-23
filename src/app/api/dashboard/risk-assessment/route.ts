import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRiskAssessment } from "@/lib/redis";

export async function GET() {
  try {
    const cached = await getRiskAssessment();
    if (cached) return NextResponse.json(cached);
  } catch { /* Redis miss */ }

  const supabase = await createClient();
  const { data } = await supabase
    .from("recession_risk_assessments")
    .select("*")
    .order("assessment_date", { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return NextResponse.json(null);
  }

  return NextResponse.json(data);
}
