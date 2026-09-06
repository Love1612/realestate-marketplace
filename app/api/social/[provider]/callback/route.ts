import {NextRequest,NextResponse} from 'next/server';
import {currentUser,providerConfig,encryptToken,SocialProvider} from '@/lib/social';
const providers=['facebook','linkedin','x'];
export async function GET(req:NextRequest,{params}:{params:Promise<{provider:string}>}){
  const {provider}=await params; if(!providers.includes(provider)) return NextResponse.redirect(new URL('/account?social=error',req.url));
  const {user,supabase}=await currentUser(); if(!user) return NextResponse.redirect(new URL('/login',req.url));
  const url=new URL(req.url); const state=url.searchParams.get('state')||''; const code=url.searchParams.get('code');
  if(!code || state!==req.cookies.get(`social_state_${provider}`)?.value) return NextResponse.redirect(new URL('/account?social=error',req.url));
  const codeVerifier=provider==='x' ? req.cookies.get('social_pkce_verifier')?.value : '';
  if(provider==='x' && !codeVerifier) return NextResponse.redirect(new URL('/account?social=error',req.url));
  const cfg=providerConfig(provider as SocialProvider); if(!cfg.client || !cfg.secret) return NextResponse.redirect(new URL('/account?social=config',req.url));
  try{
    const body=new URLSearchParams({grant_type:'authorization_code',code,redirect_uri:cfg.redirect,client_id:cfg.client});
    if(provider==='x') body.set('code_verifier',codeVerifier!);
    const tokenRes=await fetch(cfg.token,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded', ...(provider==='x'?{Authorization:'Basic '+Buffer.from(`${cfg.client}:${cfg.secret}`).toString('base64')}:{})},body:body.toString()});
    const token=await tokenRes.json(); if(!tokenRes.ok) throw new Error(JSON.stringify(token));
    let accountId=''; let accountName='';
    if(provider==='linkedin'){
      const me=await fetch('https://api.linkedin.com/v2/userinfo',{headers:{Authorization:`Bearer ${token.access_token}`}}); const data=await me.json(); accountId=data.sub; accountName=data.name||data.email||'LinkedIn';
    } else if(provider==='x'){
      const me=await fetch('https://api.x.com/2/users/me',{headers:{Authorization:`Bearer ${token.access_token}`}}); const data=await me.json(); accountId=data.data?.id||''; accountName=data.data?.name||data.data?.username||'X';
    } else {
      const pages=await fetch(`https://graph.facebook.com/${process.env.FACEBOOK_GRAPH_VERSION||'v24.0'}/me/accounts?fields=id,name,access_token&access_token=${encodeURIComponent(token.access_token)}`); const data=await pages.json();
      const page=data.data?.[0]; if(!page) throw new Error('No Facebook Page available. Connect an account that manages a Facebook Page.');
      accountId=page.id; accountName=page.name; token.access_token=page.access_token;
    }
    await supabase.from('social_connections').upsert({owner_id:user.id,provider,external_account_id:accountId,account_name:accountName,access_token:encryptToken(token.access_token),refresh_token:token.refresh_token?encryptToken(token.refresh_token):null,expires_at:token.expires_in?new Date(Date.now()+token.expires_in*1000).toISOString():null,scope:token.scope||cfg.scope,updated_at:new Date().toISOString()},{onConflict:'owner_id,provider'});
    const res=NextResponse.redirect(new URL('/account?social=connected',req.url)); res.cookies.delete(`social_state_${provider}`); if(provider==='x') res.cookies.delete('social_pkce_verifier'); return res;
  }catch{ return NextResponse.redirect(new URL('/account?social=error',req.url)); }
}
