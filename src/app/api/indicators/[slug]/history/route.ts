import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoff = ninetyDaysAgo.toISOString().split("T")[0];

  const { data: readings } = await service
    .from("indicator_readings")
    .select("reading_date, numeric_value")
    .eq("slug", slug)
    .gte("reading_date", cutoff)
    .order("reading_date", { ascending: true });

  const history = (readings || [])
    .filter((r) => r.numeric_value !== null)
    .map((r) => ({ date: r.reading_date, value: r.numeric_value }));

  return NextResponse.json({ slug, source: "supabase", history });
}
