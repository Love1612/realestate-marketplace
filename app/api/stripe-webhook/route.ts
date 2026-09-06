import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const admin=()=>createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req:Request) {
  const sig=req.headers.get("stripe-signature");
  if(!sig || !process.env.STRIPE_WEBHOOK_SECRET) return new NextResponse("Missing webhook configuration",{status:400});
  const raw=await req.text();
  let event;
  try { event=stripe.webhooks.constructEvent(raw,sig,process.env.STRIPE_WEBHOOK_SECRET); }
  catch { return new NextResponse("Invalid signature",{status:400}); }

  const sb=admin();
  const {error:dedupeError}=await sb.from('stripe_events').insert({id:event.id,type:event.type});
  if(dedupeError?.code==='23505') return NextResponse.json({received:true,duplicate:true});
  if(dedupeError) return new NextResponse("Webhook storage error",{status:500});

  if(event.type==="checkout.session.completed") {
    const session=event.data.object as any;
    if(session.payment_status !== 'paid') return NextResponse.json({received:true});
    const id=session.metadata?.listing_id, action=session.metadata?.action, ownerId=session.metadata?.owner_id;
    if(id && ownerId) {
      const {data:listing}=await sb.from("listings").select("expires_at,owner_id,status").eq("id",id).single();
      if(listing?.owner_id === ownerId) {
        const now=new Date();
        if(action==="renew") {
          const base=listing.expires_at && new Date(listing.expires_at)>now?new Date(listing.expires_at):now;
          base.setDate(base.getDate()+30);
          await sb.from("listings").update({status:"live",published_at:now.toISOString(),expires_at:base.toISOString(),updated_at:now.toISOString()}).eq("id",id).eq("owner_id",ownerId);
        } else if(listing.status==='pending_payment') {
          const expires=new Date(now); expires.setDate(expires.getDate()+30);
          await sb.from("listings").update({status:"live",published_at:now.toISOString(),expires_at:expires.toISOString(),updated_at:now.toISOString()}).eq("id",id).eq("owner_id",ownerId).eq("status","pending_payment");
        }
      }
    }
  }
  return NextResponse.json({received:true});
}
