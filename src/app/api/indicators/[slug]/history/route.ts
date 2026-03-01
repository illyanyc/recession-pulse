import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getChartLimit } from "@/lib/constants";

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
  const limit = getChartLimit(slug);

  const { data: readings } = await service
    .from("indicator_readings")
    .select("reading_date, numeric_value")
    .eq("slug", slug)
    .order("reading_date", { ascending: false })
    .limit(limit);

  const history = (readings || [])
    .reverse()
    .filter((r) => r.numeric_value !== null)
    .map((r) => ({ date: r.reading_date, value: r.numeric_value }));

  return NextResponse.json({ slug, source: "supabase", history });
}
