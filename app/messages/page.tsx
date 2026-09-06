'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
export default function Messages(){
 const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{fetch('/api/conversations').then(async r=>{const d=await r.json();if(!r.ok){setError(d.error||'Please sign in.');setLoading(false);return;}setItems(d.conversations||[]);setLoading(false);}).catch(()=>{setError('Could not load messages.');setLoading(false);})},[]);
 return <main className="section"><div className="container"><h1>Messages</h1><p className="muted">Private conversations between renters and property owners.</p>{error&&<div className="alert">{error} <Link href="/login">Sign in</Link></div>}{loading?<p>Loading messages…</p>:!items.length?<div className="empty"><h3>No conversations yet</h3><p className="muted">Contact an owner from any live listing.</p><Link className="btn btn-primary" href="/listings">Find a rental</Link></div>:<div style={{display:'grid',gap:12}}>{items.map((c:any)=>{const last=(c.messages||[]).sort((a:any,b:any)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0];return <Link href={`/messages/${c.id}`} className="panel" key={c.id}><strong>{c.listings?.title||'Rental'}</strong><p className="muted">{last?.body||'No messages yet.'}</p><small className="muted">{last?new Date(last.created_at).toLocaleString():''}</small></Link>})}</div>}</div></main>
}
