'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {createClient} from '@/lib/supabase';

export default function ConversationPage({params}:{params:Promise<{id:string}>}){
  const [id,setId]=useState(''); const [data,setData]=useState<any>(null); const [body,setBody]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  useEffect(()=>{params.then(p=>setId(p.id));},[params]);
  async function load(){ if(!id)return; const res=await fetch(`/api/conversations/${id}/messages`); const d=await res.json(); if(!res.ok){setError(d.error||'Could not load conversation.');return;} setData(d); }
  useEffect(()=>{load();},[id]);
  async function send(){ if(!body.trim()||busy)return; setBusy(true); setError(''); const res=await fetch(`/api/conversations/${id}/messages`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body})}); const d=await res.json(); if(!res.ok)setError(d.error||'Could not send.'); else {setBody('');await load();} setBusy(false); }
  if(!id)return <main className="section"><div className="container">Loading…</div></main>;
  return <main className="section"><div className="container" style={{maxWidth:760}}><Link href="/messages" className="muted">← Messages</Link><h1>{data?.conversation?.listings?.title||'Conversation'}</h1>{error&&<div className="alert">{error}</div>}<div className="panel" style={{marginBottom:14}}>{!data?<p>Loading conversation…</p>:!data.messages.length?<p className="muted">No messages yet.</p>:data.messages.map((m:any)=><div key={m.id} style={{padding:'12px 0',borderBottom:'1px solid #eee'}}><p style={{whiteSpace:'pre-wrap',marginBottom:5}}>{m.body}</p><small className="muted">{new Date(m.created_at).toLocaleString()}</small></div>)}</div><textarea className="input" rows={4} value={body} onChange={e=>setBody(e.target.value)} maxLength={4000} placeholder="Write a reply…"/><div style={{marginTop:8,display:'flex',justifyContent:'flex-end'}}><button className="btn btn-primary" onClick={send} disabled={busy||!body.trim()}>{busy?'Sending…':'Send reply'}</button></div></div></main>
}
