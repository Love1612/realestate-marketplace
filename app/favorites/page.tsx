"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Favorites() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login?next=/favorites"; return; }
      const { data } = await supabase
        .from("favorites")
        .select("listing_id, listings(*, listing_photos(public_url,sort_order))")
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false });
      setItems(data || []);
      setLoading(false);
    })();
  }, []);

  return <main className="section"><div className="container">
    <h1>Saved rentals</h1>
    <p className="muted">Keep your favorites in one place while you compare options.</p>
    {loading ? <p>Loading saved rentals…</p> :
      !items.length ? <div className="empty"><h3>No saved rentals yet</h3><p className="muted">Tap “Save” on a rental you want to remember.</p><Link className="btn btn-primary" href="/listings">Browse rentals</Link></div> :
      <div className="grid">{items.map(x => {
        const l = x.listings;
        if (!l) return null;
        const photo = (l.listing_photos || []).sort((a:any,b:any)=>a.sort_order-b.sort_order)[0];
        return <Link className="card" href={`/listings/${l.id}`} key={l.id}>
          {photo ? <img className="listing-image" src={photo.public_url} alt="" /> : <div className="listing-image" />}
          <div className="card-body"><div className="muted">{l.property_type}</div><h3>{l.title}</h3><div className="price">${Number(l.monthly_rent).toLocaleString()}/mo</div><p className="muted">{l.city}, {l.state}</p></div>
        </Link>
      })}</div>}
  </div></main>;
}