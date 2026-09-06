"use client";

import { useState } from "react";

export default function ContactOwner({ listingId }: { listingId: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listingId, message })
    });
    const data = await res.json();
    if (res.status === 401) {
      window.location.href = `/login?next=/listings/${listingId}`;
      return;
    }
    if (!res.ok) { setError(data.error || "Could not send your message."); setBusy(false); return; }
    window.location.href = `/messages/${data.conversation_id}`;
  }

  return (
    <div className="panel" style={{ marginTop: 18 }}>
      <h3>Interested in this rental?</h3>
      <p className="muted">Send the owner a message. Keep your first message simple—introduce yourself and ask about availability.</p>
      {sent ? (
        <div className="alert success">Message sent! The owner can respond through RentHub.</div>
      ) : (
        <form onSubmit={send}>
          {error && <div className="alert">{error}</div>}
          <textarea required maxLength={4000} value={message} onChange={e => setMessage(e.target.value)}
            placeholder="Hi, I'm interested in this property. Is it still available? I'd love to schedule a viewing." />
          <button className="btn btn-primary" disabled={busy} style={{ marginTop: 10 }}>
            {busy ? "Sending…" : "Send message"}
          </button>
        </form>
      )}
    </div>
  );
}