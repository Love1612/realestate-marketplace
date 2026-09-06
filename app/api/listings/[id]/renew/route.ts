import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe";

export async function POST(_:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:"Please sign in first."},{status:401});
  const {data:listing}=await supabase.from("listings").select("*").eq("id",id).eq("owner_id",user.id).single();
  if(!listing) return NextResponse.json({error:"Listing not found."},{status:404});
  const expired=!listing.expires_at || new Date(listing.expires_at)<new Date();
  if(!expired) return NextResponse.json({error:"This listing is still active."},{status:400});
  const session=await stripe.checkout.sessions.create({
    mode:"payment",
    line_items:[{price_data:{currency:"usd",product_data:{name:"RentHub listing renewal — 30 days"},unit_amount:500},quantity:1}],
    success_url:`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?renewed=1`,
    cancel_url:`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    metadata:{listing_id:id,action:"renew",owner_id:user.id}
  });
  return NextResponse.json({checkout_url:session.url});
}
