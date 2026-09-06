import {NextResponse} from "next/server";
import {createServerSupabaseClient} from "@/lib/supabase-server";
export async function POST(req:Request){
 const supabase=await createServerSupabaseClient(); const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"Please sign in to report a listing."},{status:401});
 const {listing_id,reason,details}=await req.json();
 if(!listing_id||!reason)return NextResponse.json({error:"Please choose a reason."},{status:400});
 const {error}=await supabase.from("listing_reports").insert({listing_id,reporter_id:user.id,reason,details:details||""});
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true});
}