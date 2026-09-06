import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

export async function POST(req:Request){
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:'Please sign in first.'},{status:401});
  const body=await req.json(); const listingId=String(body.listing_id||''); const message=String(body.message||'').trim();
  if(!listingId||!message) return NextResponse.json({error:'Listing and message are required.'},{status:400});
  if(message.length>4000) return NextResponse.json({error:'Message is too long (4,000 characters maximum).'}, {status:400});
  const {data:listing}=await supabase.from('listings').select('id,owner_id,status,expires_at').eq('id',listingId).single();
  if(!listing || listing.status!=='live' || !listing.expires_at || new Date(listing.expires_at)<=new Date()) return NextResponse.json({error:'This listing is no longer available.'},{status:404});
  if(listing.owner_id===user.id) return NextResponse.json({error:'You cannot message yourself about your own listing.'},{status:400});
  let {data:conversation}=await supabase.from('conversations').select('id').eq('listing_id',listingId).eq('renter_id',user.id).maybeSingle();
  if(!conversation){
    const {data:created,error}=await supabase.from('conversations').insert({listing_id:listingId,renter_id:user.id,owner_id:listing.owner_id}).select('id').single();
    if(error) return NextResponse.json({error:error.message},{status:400}); conversation=created;
  }
  const {error}=await supabase.from('messages').insert({conversation_id:conversation!.id,sender_id:user.id,body:message});
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({ok:true,conversation_id:conversation!.id});
}

export async function GET(){
  const supabase=await createServerSupabaseClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {data,error}=await supabase.from('conversations').select('id,listing_id,renter_id,owner_id,updated_at,listings(id,title,city,state),messages(body,created_at,sender_id,read_at)').or(`renter_id.eq.${user.id},owner_id.eq.${user.id}`).order('updated_at',{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({conversations:data||[]});
}
