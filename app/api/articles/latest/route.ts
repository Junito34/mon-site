import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("title, slug, published_date")
    .order("published_date", { ascending: false })
    .limit(3);

  if (error) {
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((a: any) => {
    const year = a.published_date
      ? new Date(a.published_date).getFullYear().toString()
      : "0000";
    return {
      title: a.title,
      href: `/dates/${year}/${a.slug}`,
      year,
    };
  });

  return NextResponse.json({ items });
}