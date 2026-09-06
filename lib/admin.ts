import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function requireAdmin(){
  const supabase = await createServerSupabaseClient();
  const {data:{user}} = await supabase.auth.getUser();
  if(!user) return {user:null, admin:null, supabase};
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const {data:profile} = await admin.from('profiles').select('id,role,full_name').eq('id',user.id).single();
  return {user, admin, supabase, profile, isAdmin: profile?.role === 'admin'};
}
