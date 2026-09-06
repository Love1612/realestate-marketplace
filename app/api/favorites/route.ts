import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to save rentals." }, { status: 401 });

  const { listing_id, action } = await req.json();
  if (!listing_id) return NextResponse.json({ error: "Missing listing." }, { status: 400 });

  if (action === "remove") {
    const { error } = await supabase.from("favorites").delete().eq("renter_id", user.id).eq("listing_id", listing_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    const { error } = await supabase.from("favorites").upsert({ renter_id: user.id, listing_id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}