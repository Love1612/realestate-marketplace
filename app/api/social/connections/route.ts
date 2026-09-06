import {NextResponse} from 'next/server';
import {currentUser} from '@/lib/social';
export async function GET(){ const {supabase,user}=await currentUser(); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401}); const {data,error}=await supabase.from('social_connections').select('id,provider,account_name,external_account_id,expires_at,created_at,updated_at').eq('owner_id',user.id).order('provider'); if(error) return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({connections:data||[]}); }
