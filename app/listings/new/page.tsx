"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import PhotoUploader from "@/components/PhotoUploader";
import { LISTING_PLANS } from "@/lib/pricing";

export default function NewListing() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({ title:"", description:"", property_type:"House", address:"", city:"", state:"", zip:"", monthly_rent:"", bedrooms:"", bathrooms:"", available_on:"", total_monthly_fees:"", security_deposit:"", pets_allowed:false, parking:"", plan:"basic" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?next=/listings/new"); return; }

      const res = await fetch("/api/listings", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({...form, monthly_rent:Number(form.monthly_rent), bedrooms:Number(form.bedrooms || 0), bathrooms:Number(form.bathrooms || 0), total_monthly_fees:Number(form.total_monthly_fees||0), security_deposit:Number(form.security_deposit||0)})
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create listing.");

      const listingId = data.listing.id;
      for (let i=0; i<files.length; i++) {
        const file = files[i];
        const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
        const path = `${user.id}/${listingId}/${i}-${crypto.randomUUID()}-${safe}`;
        const { error: uploadError } = await supabase.storage.from("listing-photos").upload(path, file, { upsert:false, contentType:file.type });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from("listing-photos").getPublicUrl(path);
        const { error: photoError } = await supabase.from("listing_photos").insert({ listing_id:listingId, storage_path:path, public_url:publicData.publicUrl, sort_order:i });
        if (photoError) throw photoError;
      }

      window.location.href = data.checkout_url;
    } catch (err:any) {
      setError(err.message || "Something went wrong.");
      setBusy(false);
    }
  }

  const update = (key:string, value:string) => setForm({...form, [key]:value});

  return (
    <main className="section"><div className="container">
      <div className="form">
        <h1>List your property</h1>
        <p className="muted">Choose a plan for 30 days. Basic is $5, Featured is $8, and Premium is $12. You can edit the listing during that time.</p>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={submit}>
          <div className="field"><label>Listing title</label><input className="input" required placeholder="Bright 2-bedroom home near downtown" value={form.title} onChange={e=>update("title",e.target.value)} /></div>
          <div className="field"><label>Description</label><textarea required placeholder="Tell renters what makes this property a good fit." value={form.description} onChange={e=>update("description",e.target.value)} /></div>
          <div className="form-row">
            <div className="field"><label>Property type</label><select className="input" value={form.property_type} onChange={e=>update("property_type",e.target.value)}>{["House","Apartment","Condo","Townhome","Room","Duplex","Triplex","Fourplex","Multi-family","Cabin","Vacation rental","RV space","Parking","Commercial","Office/Retail","Land","Warehouse/Industrial","Other"].map(x=><option key={x}>{x}</option>)}</select></div>
            <div className="field"><label>Monthly rent ($)</label><input className="input" type="number" min="0" required value={form.monthly_rent} onChange={e=>update("monthly_rent",e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Bedrooms</label><input className="input" type="number" min="0" value={form.bedrooms} onChange={e=>update("bedrooms",e.target.value)} /></div>
            <div className="field"><label>Bathrooms</label><input className="input" type="number" min="0" step=".5" value={form.bathrooms} onChange={e=>update("bathrooms",e.target.value)} /></div>
          </div>
          <div className="field"><label>Address</label><input className="input" required value={form.address} onChange={e=>update("address",e.target.value)} /></div>
          <div className="form-row">
            <div className="field"><label>City</label><input className="input" required value={form.city} onChange={e=>update("city",e.target.value)} /></div>
            <div className="field"><label>State</label><input className="input" required value={form.state} onChange={e=>update("state",e.target.value)} /></div>
          </div>
          <div className="form-row"><div className="field"><label>Fixed monthly fees</label><input className="input" type="number" min="0" value={form.total_monthly_fees} onChange={e=>update("total_monthly_fees",e.target.value)} /></div><div className="field"><label>Security deposit</label><input className="input" type="number" min="0" value={form.security_deposit} onChange={e=>update("security_deposit",e.target.value)} /></div></div><div className="form-row">
            <div className="field"><label>ZIP code</label><input className="input" required value={form.zip} onChange={e=>update("zip",e.target.value)} /></div>
            <div className="field"><label>Available on</label><input className="input" type="date" value={form.available_on} onChange={e=>update("available_on",e.target.value)} /></div>
          </div>
          <div className="field"><label>Listing plan</label><div className="form-row">{Object.entries(LISTING_PLANS).map(([key,p])=><label key={key} className="panel" style={{cursor:"pointer",display:"block"}}><input type="radio" name="plan" value={key} checked={form.plan===key} onChange={()=>update("plan",key)} /> <strong>{p.name}</strong> — {p.label}<div className="muted">{key==="basic"?"Standard placement":key==="featured"?"Extra visibility and featured placement":"Maximum visibility and rich-media emphasis"}</div></label>)}</div></div>
          <div className="field"><label>Photos</label><PhotoUploader files={files} setFiles={setFiles} /></div>
          <div className="panel" style={{margin:"18px 0"}}><strong>Before you publish</strong><p className="muted">Your selected plan will be charged once for 30 days. Fixed monthly fees are shown separately so renters can understand total monthly cost. RentHub does not take a percentage of rent.</p></div>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Preparing your listing…" : "Continue to secure payment"}</button>
        </form>
      </div>
    </div></main>
  );
}
