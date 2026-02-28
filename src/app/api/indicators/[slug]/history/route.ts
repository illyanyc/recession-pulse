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

  const { data: readings } = await service
    .from("indicator_readings")
    .select("reading_date, numeric_value")
    .eq("slug", slug)
    .order("reading_date", { ascending: true })
    .limit(90);

  const history = (readings || [])
    .filter((r) => r.numeric_value !== null)
    .map((r) => ({ date: r.reading_date, value: r.numeric_value }));

  return NextResponse.json({ slug, source: "supabase", history });
}
