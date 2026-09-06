import {createServerSupabaseClient} from '@/lib/supabase-server';
import ConnectSocial from '@/app/social/ConnectSocial';

export default async function Account(){
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  return <main className="section"><div className="container"><h1>Account</h1><div className="card"><p><strong>Email:</strong> {user?.email || 'Not signed in'}</p><form action="/auth/signout" method="post"><button className="btn btn-light">Sign out</button></form></div><ConnectSocial/></div></main>
}
