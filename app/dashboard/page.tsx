"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Dashboard() {
  const [listings,setListings]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  async function load() {
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){ window.location.href="/login?next=/dashboard"; return; }
    const {data,error}=await supabase.from("listings").select("*,listing_photos(public_url,sort_order)").eq("owner_id",user.id).order("created_at",{ascending:false});
    if(error) setError(error.message); else setListings(data || []);
    setLoading(false);
  }
  useEffect(()=>{load()},[]);

  if(loading) return <main className="section"><div className="container">Loading your listings…</div></main>;

  return <main className="section"><div className="container">
    <div style={{display:"flex",justifyContent:"space-between",gap:15,alignItems:"center",marginBottom:22,flexWrap:"wrap"}}>
      <div><h1 style={{marginBottom:5}}>My listings</h1><p className="muted">Manage photos, details, and renewals in one place.</p></div>
      <div className="dashboard-actions"><Link className="btn btn-light" href="/dashboard/inquiries">Messages</Link><Link className="btn btn-primary" href="/listings/new">+ Add a property</Link></div>
    </div>
    {error && <div className="alert">{error}</div>}
    {!listings.length ? <div className="empty"><h3>No listings yet</h3><p className="muted">Create your first rental listing for $5.</p><Link className="btn btn-primary" href="/listings/new">Create a listing</Link></div> :
      <div className="grid">{listings.map(l=>{
        const photo=(l.listing_photos||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order)[0];
        const expired = l.expires_at && new Date(l.expires_at) < new Date();
        const status = expired ? "expired" : l.status;
        return <div className="card" key={l.id}>
          {photo ? <img className="listing-image" src={photo.public_url} alt="" /> : <div className="listing-image" />}
          <div className="card-body">
            <div style={{display:"flex",justifyContent:"space-between",gap:8}}><span className={`badge ${status}`}>{status}</span><span className="muted">{l.property_type}</span></div>
            <h3>{l.title}</h3><div className="price">${Number(l.monthly_rent).toLocaleString()}/mo</div><p className="muted">{l.city}, {l.state}</p>
            <p className="muted">{expired ? "Expired" : l.expires_at ? `Runs through ${new Date(l.expires_at).toLocaleDateString()}` : "Not published yet"}</p>
            <div className="dashboard-actions"><Link className="btn btn-secondary" href={`/dashboard/listing/${l.id}`}>Edit listing</Link>{status==="expired" && <RenewButton id={l.id} />}</div>
          </div>
        </div>
      })}</div>}
  </div></main>
}

function RenewButton({id}:{id:string}) {
  const [busy,setBusy]=useState(false);
  async function renew(){
    setBusy(true);
    const res=await fetch(`/api/listings/${id}/renew`,{method:"POST"});
    const data=await res.json();
    if(!res.ok){alert(data.error||"Could not renew.");setBusy(false);return;}
    window.location.href=data.checkout_url;
  }
  return <button className="btn btn-primary" onClick={renew} disabled={busy}>{busy?"Preparing…":"Renew · $5"}</button>
}
