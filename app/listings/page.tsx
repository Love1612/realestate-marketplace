"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const types = ["House","Apartment","Condo","Townhome","Room","Duplex","Triplex","Fourplex","Multi-family","Cabin","Vacation rental","RV space","Parking","Commercial","Office/Retail","Land","Warehouse/Industrial","Other"];

export default function Listings() {
  const [listings,setListings]=useState<any[]>([]);
  const [q,setQ]=useState(""); const [type,setType]=useState(""); const [max,setMax]=useState("");
  const [beds,setBeds]=useState(""); const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    const supabase=createClient();
    let query=supabase.from("listings").select("*,listing_photos(public_url,sort_order)")
      .eq("status","live").gt("expires_at",new Date().toISOString()).order("created_at",{ascending:false});
    if(q.trim()) query=query.or(`city.ilike.%${q.trim()}%,state.ilike.%${q.trim()}%,title.ilike.%${q.trim()}%,zip.ilike.%${q.trim()}%`);
    if(type) query=query.eq("property_type",type);
    if(max) query=query.lte("monthly_rent",Number(max));
    if(beds) query=query.gte("bedrooms",Number(beds));
    const {data}=await query; setListings(data||[]);setLoading(false);
  }
  useEffect(()=>{load()},[]);

  return <main className="section"><div className="container">
    <h1>Find a rental</h1><p className="muted">Search by location, price, property type, and bedrooms.</p>
    <div className="searchbox" style={{marginBottom:25}}>
      <input className="input" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="City, ZIP, or keyword"/>
      <select className="input" value={type} onChange={e=>setType(e.target.value)}><option value="">Any property type</option>{types.map(x=><option key={x}>{x}</option>)}</select>
      <select className="input" value={beds} onChange={e=>setBeds(e.target.value)}><option value="">Any bedrooms</option><option value="1">1+ bedroom</option><option value="2">2+ bedrooms</option><option value="3">3+ bedrooms</option><option value="4">4+ bedrooms</option></select>
      <select className="input" value={max} onChange={e=>setMax(e.target.value)}><option value="">Any rent</option><option value="1000">$1,000 or less</option><option value="1500">$1,500 or less</option><option value="2000">$2,000 or less</option><option value="3000">$3,000 or less</option><option value="5000">$5,000 or less</option></select>
      <button className="btn btn-primary" onClick={load}>Search</button>
    </div>
    {loading?<p>Finding rentals…</p>:!listings.length?<div className="empty"><h3>No matching rentals</h3><p className="muted">Try removing a filter or searching a nearby city.</p></div>:
      <><p className="muted" style={{marginBottom:12}}>{listings.length} rental{listings.length===1?"":"s"} found</p><div className="grid">{listings.map(l=>{const photo=(l.listing_photos||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order)[0];return <Link href={`/listings/${l.id}`} className="card" key={l.id}>{photo?<img className="listing-image" src={photo.public_url} alt=""/>:<div className="listing-image"/>}<div className="card-body"><div className="muted">{l.property_type}</div><h3>{l.title}</h3><div className="price">${Number(l.monthly_rent).toLocaleString()}/mo</div><p className="muted">{l.city}, {l.state} · {l.bedrooms||0} bd · {l.bathrooms||0} ba</p></div></Link>})}</div></>}
  </div></main>
}