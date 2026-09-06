"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function FavoriteButton({ listingId }: { listingId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("favorites").select("listing_id").eq("renter_id", user.id).eq("listing_id", listingId).maybeSingle();
      setSaved(!!data);
    })();
  }, [listingId]);

  async function toggle() {
    setBusy(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listingId, action: saved ? "remove" : "save" })
    });
    if (res.status === 401) {
      window.location.href = `/login?next=/listings/${listingId}`;
      return;
    }
    if (res.ok) setSaved(!saved);
    setBusy(false);
  }

  return <button className="btn btn-light" onClick={toggle} disabled={busy} aria-label={saved ? "Remove from saved" : "Save rental"}>
    {saved ? "♥ Saved" : "♡ Save"}
  </button>;
}