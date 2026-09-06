"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import PhotoUploader from "@/components/PhotoUploader";

export default function EditListing() {
  const {id}=useParams<{id:string}>();
  const router=useRouter();
  const supabase=createClient();
  const [listing,setListing]=useState<any>(null);
  const [existing,setExisting]=useState<any[]>([]);
  const [newFiles,setNewFiles]=useState<File[]>([]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  useEffect(()=>{(async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.push(`/login?next=/dashboard/listing/${id}`);return;}
    const {data,error}=await supabase.from("listings").select("*,listing_photos(*)").eq("id",id).eq("owner_id",user.id).single();
    if(error){setError("Listing not found or you do not have access.");return;}
    setListing(data); setExisting((data.listing_photos||[]).sort((a:any,b:any)=>a.sort_order-b.sort_order));
  })()},[id]);

  if(!listing) return <main className="section"><div className="container">{error?<div className="alert">{error}</div>:"Loading listing…"}</div></main>;

  const update=(k:string,v:string)=>setListing({...listing,[k]:v});

  async function save(){
    setBusy(true);setError("");setMessage("");
    const {error}=await supabase.from("listings").update({
      title:listing.title,description:listing.description,property_type:listing.property_type,
      address:listing.address,city:listing.city,state:listing.state,zip:listing.zip,
      monthly_rent:Number(listing.monthly_rent),bedrooms:Number(listing.bedrooms||0),bathrooms:Number(listing.bathrooms||0),available_on:listing.available_on || null
    }).eq("id",id);
    if(error){setError(error.message);setBusy(false);return;}

    // Refresh the stored map pin whenever the owner changes the address.
    try {
      const locationQuery = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
      const geo = await fetch(`/api/geocode?q=${encodeURIComponent(locationQuery)}`);
      if (geo.ok) {
        const g = await geo.json();
        if (Number.isFinite(Number(g.lat)) && Number.isFinite(Number(g.lon))) {
          await supabase.from("listings").update({latitude:Number(g.lat),longitude:Number(g.lon),location_updated_at:new Date().toISOString()}).eq("id",id).eq("owner_id",listing.owner_id);
        }
      }
    } catch {}

    if(existing.length + newFiles.length > 12){ setError('A listing can have at most 12 photos.'); setBusy(false); return; }
    for(let i=0;i<newFiles.length;i++){
      const f=newFiles[i];
      if(!['image/jpeg','image/png','image/webp'].includes(f.type) || f.size > 10*1024*1024){ setError('Each photo must be JPG, PNG, or WebP and 10 MB or smaller.'); setBusy(false); return; }
      const safe=f.name.toLowerCase().replace(/[^a-z0-9._-]/g,"-");
      const path=`${listing.owner_id}/${id}/${existing.length+i}-${crypto.randomUUID()}-${safe}`;
      const up=await supabase.storage.from("listing-photos").upload(path,f,{upsert:false,contentType:f.type});
      if(up.error){setError(up.error.message);setBusy(false);return;}
      const {data:pub}=supabase.storage.from("listing-photos").getPublicUrl(path);
      const ins=await supabase.from("listing_photos").insert({listing_id:id,storage_path:path,public_url:pub.publicUrl,sort_order:existing.length+i});
      if(ins.error){setError(ins.error.message);setBusy(false);return;}
    }
    const {data:photos}=await supabase.from("listing_photos").select("*").eq("listing_id",id).order("sort_order");
    setExisting(photos||[]);setNewFiles([]);setMessage("Saved. Your listing is up to date.");setBusy(false);
  }

  async function deletePhoto(photo:any){
    if(!confirm("Remove this photo?")) return;
    await supabase.storage.from("listing-photos").remove([photo.storage_path]);
    await supabase.from("listing_photos").delete().eq("id",photo.id);
    const next=existing.filter(x=>x.id!==photo.id).map((x,i)=>({...x,sort_order:i}));
    for(const p of next) await supabase.from("listing_photos").update({sort_order:p.sort_order}).eq("id",p.id);
    setExisting(next);
  }

  async function movePhoto(i:number,dir:-1|1){
    const j=i+dir;if(j<0||j>=existing.length)return;
    const next=[...existing];[next[i],next[j]]=[next[j],next[i]];
    for(let n=0;n<next.length;n++) await supabase.from("listing_photos").update({sort_order:n}).eq("id",next[n].id);
    setExisting(next);
  }

  return <main className="section"><div className="container"><div className="form">
    <h1>Edit your listing</h1>
    <p className="muted">Your $5 publication period stays active while you make edits.</p>
    {message&&<div className="alert success">{message}</div>}{error&&<div className="alert">{error}</div>}
    <div className="field"><label>Listing title</label><input className="input" value={listing.title} onChange={e=>update("title",e.target.value)}/></div>
    <div className="field"><label>Description</label><textarea value={listing.description} onChange={e=>update("description",e.target.value)}/></div>
    <div className="form-row"><div className="field"><label>Property type</label><select className="input" value={listing.property_type} onChange={e=>update("property_type",e.target.value)}>{["House","Apartment","Condo","Townhome","Room","Duplex","Triplex","Fourplex","Multi-family","Cabin","Vacation rental","RV space","Parking","Commercial","Office/Retail","Land","Warehouse/Industrial","Other"].map(x=><option key={x}>{x}</option>)}</select></div><div className="field"><label>Monthly rent</label><input className="input" type="number" value={listing.monthly_rent} onChange={e=>update("monthly_rent",e.target.value)}/></div></div>
    <div className="form-row"><div className="field"><label>Bedrooms</label><input className="input" type="number" value={listing.bedrooms||0} onChange={e=>update("bedrooms",e.target.value)}/></div><div className="field"><label>Bathrooms</label><input className="input" type="number" step=".5" value={listing.bathrooms||0} onChange={e=>update("bathrooms",e.target.value)}/></div></div>
    <div className="form-row"><div className="field"><label>City</label><input className="input" value={listing.city} onChange={e=>update("city",e.target.value)}/></div><div className="field"><label>State</label><input className="input" value={listing.state} onChange={e=>update("state",e.target.value)}/></div></div>
    <div className="form-row"><div className="field"><label>ZIP</label><input className="input" value={listing.zip} onChange={e=>update("zip",e.target.value)}/></div><div className="field"><label>Available on</label><input className="input" type="date" value={listing.available_on||""} onChange={e=>update("available_on",e.target.value)}/></div></div>
    <div className="field"><label>Current photos</label>
      {!existing.length?<p className="muted">No photos yet.</p>:<div className="photo-grid">{existing.map((p,i)=><div className="photo-item" key={p.id}><img src={p.public_url} alt=""/><div className="photo-actions"><button type="button" onClick={()=>movePhoto(i,-1)} disabled={i===0}>←</button><button type="button" onClick={()=>movePhoto(i,1)} disabled={i===existing.length-1}>→</button><button type="button" className="photo-remove" onClick={()=>deletePhoto(p)}>Remove</button></div></div>)}</div>}
    </div>
    <div className="field"><label>Add more photos</label><PhotoUploader files={newFiles} setFiles={setNewFiles}/></div>
    <button className="btn btn-primary" disabled={busy} onClick={save}>{busy?"Saving…":"Save changes"}</button>
  </div></div></main>
}
