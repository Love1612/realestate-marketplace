import {NextResponse} from 'next/server';
import {createServerSupabaseClient} from '@/lib/supabase-server';

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params; const supabase=await createServerSupabaseClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {data:conversation}=await supabase.from('conversations').select('id,listing_id,renter_id,owner_id,listings(id,title,city,state)').eq('id',id).or(`renter_id.eq.${user.id},owner_id.eq.${user.id}`).single();
  if(!conversation) return NextResponse.json({error:'Conversation not found.'},{status:404});
  await supabase.from('messages').update({read_at:new Date().toISOString()}).eq('conversation_id',id).neq('sender_id',user.id).is('read_at',null);
  const {data:messages,error}=await supabase.from('messages').select('id,sender_id,body,read_at,created_at').eq('conversation_id',id).order('created_at',{ascending:true});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({conversation,messages:messages||[]});
}

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params; const supabase=await createServerSupabaseClient(); const {data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=String((await req.json()).body||'').trim();
  if(!body) return NextResponse.json({error:'Message cannot be empty.'},{status:400});
  if(body.length>4000) return NextResponse.json({error:'Message is too long (4,000 characters maximum).'}, {status:400});
  const {data:conversation}=await supabase.from('conversations').select('id').eq('id',id).or(`renter_id.eq.${user.id},owner_id.eq.${user.id}`).single();
  if(!conversation) return NextResponse.json({error:'Conversation not found.'},{status:404});
  const {data:message,error}=await supabase.from('messages').insert({conversation_id:id,sender_id:user.id,body}).select().single();
  if(error) return NextResponse.json({error:error.message},{status:400});
  await supabase.from('conversations').update({updated_at:new Date().toISOString()}).eq('id',id);
  const {data:participants}=await supabase.from('conversations').select('renter_id,owner_id,listings(title)').eq('id',id).single();
  const recipient=participants && (participants.renter_id===user.id?participants.owner_id:participants.renter_id);
  if(recipient) await supabase.from('notifications').insert({user_id:recipient,type:'new_message',title:'New RentHub message',body:`You received a new message about ${participants?.listings?.title||'a rental listing'}.`});
  return NextResponse.json({ok:true,message});
}
