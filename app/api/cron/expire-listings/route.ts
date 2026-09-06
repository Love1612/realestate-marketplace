import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req:Request) {
  if(process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized",{status:401});
  const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const {error}=await sb.from("listings").update({status:"expired"}).eq("status","live").lt("expires_at",new Date().toISOString());
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
