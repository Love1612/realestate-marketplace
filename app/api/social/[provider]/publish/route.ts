import {NextRequest,NextResponse} from 'next/server';
import {currentUser,decryptToken,SocialProvider} from '@/lib/social';
export async function POST(req:NextRequest,{params}:{params:Promise<{provider:string}>}){
  const {provider}=await params; if(!['facebook','linkedin','x'].includes(provider)) return NextResponse.json({error:'Unsupported provider'},{status:400});
  const {supabase,user}=await currentUser(); if(!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json(); const listingId=String(body.listingId||''); if(!listingId) return NextResponse.json({error:'listingId is required'},{status:400});
  const {data:listing}=await supabase.from('listings').select('id,title,description,monthly_rent,city,state,owner_id,status,expires_at,listing_photos(public_url)').eq('id',listingId).eq('owner_id',user.id).single();
  if(!listing || listing.status!=='live' || new Date(listing.expires_at)<new Date()) return NextResponse.json({error:'Listing is not live.'},{status:400});
  const {data:conn}=await supabase.from('social_connections').select('*').eq('owner_id',user.id).eq('provider',provider).single(); if(!conn) return NextResponse.json({error:'Connect this social account first.'},{status:400});
  const token=decryptToken(conn.access_token); const site=process.env.NEXT_PUBLIC_SITE_URL||new URL(req.url).origin; const link=`${site}/listings/${listing.id}`; const text=`${listing.title} — $${Number(listing.monthly_rent).toLocaleString()}/month in ${listing.city}, ${listing.state}. ${String(listing.description||'').slice(0,180)} ${link}`; const image=listing.listing_photos?.[0]?.public_url;
  try{
    let result:any;
    if(provider==='x'){
      const r=await fetch('https://api.x.com/2/tweets',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({text:text.slice(0,280)})}); result=await r.json(); if(!r.ok) throw new Error(JSON.stringify(result));
    } else if(provider==='linkedin'){
      const r=await fetch('https://api.linkedin.com/rest/posts',{method:'POST',headers:{Authorization:`Bearer ${token}`,'X-Restli-Protocol-Version':'2.0.0','Linkedin-Version':process.env.LINKEDIN_VERSION||'202608','Content-Type':'application/json'},body:JSON.stringify({author:`urn:li:person:${conn.external_account_id}`,commentary:text.slice(0,1300),visibility:'PUBLIC',distribution:{feedDistribution:'MAIN_FEED',targetEntities:[],thirdPartyDistributionChannels:[]},lifecycleState:'PUBLISHED',isReshareDisabledByAuthor:false})}); result=await r.text(); if(!r.ok) throw new Error(result);
    } else {
      const r=await fetch(`https://graph.facebook.com/${process.env.FACEBOOK_GRAPH_VERSION||'v24.0'}/${conn.external_account_id}/feed`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({message:text,link,access_token:token}).toString()}); result=await r.json(); if(!r.ok) throw new Error(JSON.stringify(result));
    }
    await supabase.from('social_posts').insert({owner_id:user.id,listing_id:listing.id,provider,connection_id:conn.id,post_text:text,status:'published',external_post_id:typeof result==='string'?'':(result.id||result.data?.id||null),published_at:new Date().toISOString()});
    return NextResponse.json({ok:true,result});
  }catch(e){ const message=e instanceof Error?e.message:'Publish failed'; await supabase.from('social_posts').insert({owner_id:user.id,listing_id:listing.id,provider,connection_id:conn.id,post_text:text,status:'failed',error_message:message}); return NextResponse.json({error:message},{status:502}); }
}
