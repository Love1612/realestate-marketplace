"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function OwnerInquiries() {
  const [items,setItems]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href="/login?next=/dashboard/inquiries";return;}
    const {data:listings}=await supabase.from("listings").select("id,title").eq("owner_id",user.id);
    const ids=(listings||[]).map(x=>x.id);
    if(!ids.length){setLoading(false);return;}
    const {data}=await supabase.from("inquiries").select("*,listings(id,title)").in("listing_id",ids).order("created_at",{ascending:false});
    setItems(data||[]);setLoading(false);
  })()},[]);

  return <main className="section"><div className="container"><h1>Owner messages</h1><p className="muted">See inquiries from people interested in your properties.</p>
    {loading?<p>Loading messages…</p>:!items.length?<div className="empty"><h3>No inquiries yet</h3><p className="muted">When renters contact you, their messages will appear here.</p></div>:
      <div style={{display:"grid",gap:12}}>{items.map(m=><div className="panel" key={m.id}><strong>{m.listings?.title||"Your listing"}</strong><p style={{whiteSpace:"pre-wrap"}}>{m.message}</p><small className="muted">{new Date(m.created_at).toLocaleString()}</small></div>)}</div>}
  </div></main>;
}