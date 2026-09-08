import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";
import { assertSameOrigin } from "@/lib/security";
import { validateListingInput } from "@/lib/listing-validation";
import { LISTING_PLANS } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try { assertSameOrigin(req); } catch { return NextResponse.json({error:"Invalid request origin."},{status:403}); }
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Please sign in first."},{status:401});
  let input;
  try { const raw=await req.json(); input=validateListingInput(raw); } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:"Invalid listing."},{status:400}); }
  const plan = "basic";

  const {data:profile}=await supabase.from("profiles").select("id,role").eq("id",user.id).maybeSingle();
  if(!profile) {
    const {error:pe}=await supabase.from("profiles").insert({id:user.id,role:"owner"});
    if(pe) return NextResponse.json({error:pe.message},{status:500});
  } else if(profile.role==='renter') {
    const {error:pe}=await supabase.from("profiles").update({role:"owner"}).eq("id",user.id);
    if(pe) return NextResponse.json({error:pe.message},{status:500});
  }

  const {data:listing,error}=await supabase.from("listings").insert({owner_id:user.id,...input,status:"pending_payment",plan}).select().single();
  if(error) return NextResponse.json({error:error.message},{status:400});

  try {
    const locationQuery = `${input.address}, ${input.city}, ${input.state} ${input.zip}`;
    const geo = await fetch(`${new URL(req.url).origin}/api/geocode?q=${encodeURIComponent(locationQuery)}`, { cache:"no-store" });
    if (geo.ok) {
      const g = await geo.json();
      if (Number.isFinite(Number(g.lat)) && Number.isFinite(Number(g.lon))) {
        await supabase.from("listings").update({latitude:Number(g.lat),longitude:Number(g.lon),location_updated_at:new Date().toISOString()}).eq("id",listing.id).eq("owner_id",user.id);
      }
    }
  } catch {}

  try {
    const session=await stripe.checkout.sessions.create({
      mode:"payment",
      line_items:[{price_data:{currency:"usd",product_data:{name:`RentHub listing — 30 days`},unit_amount:LISTING_PLANS.basic.cents},quantity:1}],
      success_url:`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?paid=1`,
      cancel_url:`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
      metadata:{listing_id:listing.id,action:"publish",owner_id:user.id,plan}
    });
    return NextResponse.json({listing,checkout_url:session.url});
  } catch {
    await supabase.from('listings').delete().eq('id',listing.id).eq('owner_id',user.id).eq('status','pending_payment');
    return NextResponse.json({error:"We couldn't start payment. Please try again."},{status:502});
  }
}
