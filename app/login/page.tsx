"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function LoginForm() {
  const params = useSearchParams();
  const [email,setEmail] = useState("");
  const [sent,setSent] = useState(false);
  const [error,setError] = useState(params.get("error") === "oauth" ? "Social sign-in could not be completed. Please try again." : "");

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setError("");
    const supabase=createClient();
    const {error}=await supabase.auth.signInWithOtp({email, options:{emailRedirectTo:`${window.location.origin}${params.get("next") || "/dashboard"}`}});
    if(error) setError(error.message); else setSent(true);
  }

  async function oauth(provider:"google"|"apple"|"facebook") {
    setError("");
    const supabase=createClient();
    const next=params.get("next") || "/dashboard";
    const {data,error}=await supabase.auth.signInWithOAuth({
      provider,
      options:{
        redirectTo:`${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        skipBrowserRedirect:false
      }
    });
    if(error) { setError(error.message); return; }
    if(data?.url) window.location.assign(data.url);
  }

  return <main className="section"><div className="container"><div className="form">
    <h1>Welcome to RentHub</h1>
    <p className="muted">Sign in with a secure email link. No password to remember.</p>
    {error && <div className="alert">{error}</div>}
    <div className="oauth-grid">
      <button className="btn btn-light" onClick={()=>oauth("google")}>Continue with Google</button>
      <button className="btn btn-light" onClick={()=>oauth("apple")}>Continue with Apple</button>
      <button className="btn btn-light" onClick={()=>oauth("facebook")}>Continue with Facebook</button>
    </div>
    <div className="divider"><span>or use email</span></div>
    {sent ? <div className="alert success">Check your email for your secure sign-in link.</div> :
      <form onSubmit={submit}><div className="field"><label>Email address</label><input className="input" type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div><button className="btn btn-primary">Send sign-in link</button></form>}
  </div></div></main>
}

export default function Login() {
  return <Suspense fallback={<main className="section"><div className="container"><p className="muted">Loading sign-in…</p></div></main>}>
    <LoginForm />
  </Suspense>
}
