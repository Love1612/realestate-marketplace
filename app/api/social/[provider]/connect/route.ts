import {NextRequest,NextResponse} from 'next/server';
import crypto from 'crypto';
import {currentUser,providerConfig,SocialProvider} from '@/lib/social';
const providers=['facebook','linkedin','x'];
export async function GET(req:NextRequest,{params}:{params:Promise<{provider:string}>}){
  const {provider}=await params;
  if(!providers.includes(provider)) return NextResponse.json({error:'Unsupported provider'},{status:400});
  const {user}=await currentUser(); if(!user) return NextResponse.redirect(new URL('/login?next=/account',req.url));
  const cfg=providerConfig(provider as SocialProvider); if(!cfg.client) return NextResponse.json({error:`${provider} OAuth is not configured`},{status:503});
  const state=crypto.randomBytes(24).toString('base64url');
  const codeVerifier=provider==='x' ? crypto.randomBytes(48).toString('base64url') : '';
  const authParams=new URLSearchParams({response_type:'code',client_id:cfg.client,redirect_uri:cfg.redirect,scope:cfg.scope,state});
  if(provider==='x') authParams.set('code_challenge_method','S256'), authParams.set('code_challenge',crypto.createHash('sha256').update(codeVerifier).digest('base64url').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'));
  const res=NextResponse.redirect(`${cfg.authorize}?${authParams}`);
  res.cookies.set(`social_state_${provider}`,state,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:600,path:'/'});
  if(provider==='x') res.cookies.set('social_pkce_verifier',codeVerifier,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',maxAge:600,path:'/'});
  return res;
}
