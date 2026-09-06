import crypto from 'crypto';
import {createServerSupabaseClient} from '@/lib/supabase-server';

export type SocialProvider = 'facebook'|'linkedin'|'x';
const key = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
function encryptionKey(){
  if(!key) throw new Error('SOCIAL_TOKEN_ENCRYPTION_KEY is not configured');
  return crypto.createHash('sha256').update(key).digest();
}
export function encryptToken(value:string){
  const iv=crypto.randomBytes(12); const cipher=crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const enc=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return [iv.toString('base64url'),cipher.getAuthTag().toString('base64url'),enc.toString('base64url')].join('.');
}
export function decryptToken(value:string){
  const [iv,tag,data]=value.split('.');
  const decipher=crypto.createDecipheriv('aes-256-gcm',encryptionKey(),Buffer.from(iv,'base64url'));
  decipher.setAuthTag(Buffer.from(tag,'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(data,'base64url')),decipher.final()]).toString('utf8');
}

export function providerConfig(provider:SocialProvider){
  const base=process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  if(provider==='facebook') return {
    authorize:'https://www.facebook.com/v24.0/dialog/oauth',
    token:'https://graph.facebook.com/v24.0/oauth/access_token',
    client:process.env.FACEBOOK_CLIENT_ID, secret:process.env.FACEBOOK_CLIENT_SECRET,
    scope:'pages_show_list,pages_read_engagement,pages_manage_posts', redirect:`${base}/api/social/facebook/callback`
  };
  if(provider==='linkedin') return {
    authorize:'https://www.linkedin.com/oauth/v2/authorization',
    token:'https://www.linkedin.com/oauth/v2/accessToken',
    client:process.env.LINKEDIN_CLIENT_ID, secret:process.env.LINKEDIN_CLIENT_SECRET,
    scope:'openid profile email w_member_social', redirect:`${base}/api/social/linkedin/callback`
  };
  return {
    authorize:'https://twitter.com/i/oauth2/authorize',
    token:'https://api.x.com/2/oauth2/token',
    client:process.env.X_CLIENT_ID, secret:process.env.X_CLIENT_SECRET,
    scope:'tweet.read tweet.write users.read offline.access', redirect:`${base}/api/social/x/callback`
  };
}

export async function currentUser(){
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  return {supabase,user};
}
