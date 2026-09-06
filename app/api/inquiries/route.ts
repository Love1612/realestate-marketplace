import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in to contact the owner." }, { status: 401 });

  const body = await req.json();
  if (!body.listing_id || !body.message?.trim()) {
    return NextResponse.json({ error: "Please write a message first." }, { status: 400 });
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", body.listing_id)
    .eq("status", "live")
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!listing) return NextResponse.json({ error: "This listing is no longer available." }, { status: 404 });

  const { error } = await supabase.from("inquiries").insert({
    listing_id: body.listing_id,
    renter_id: user.id,
    message: body.message.trim()
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}