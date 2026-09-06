"use client";
import {useEffect,useState} from 'react';
const providers=['facebook','linkedin','x'] as const;
export default function ConnectSocial(){
 const [connections,setConnections]=useState<any[]>([]); const [msg,setMsg]=useState('');
 async function load(){const r=await fetch('/api/social/connections'); if(r.ok) setConnections((await r.json()).connections||[])}
 useEffect(()=>{load()},[]);
 const connected=(p:string)=>connections.find(c=>c.provider===p);
 return <section className="card"><h2>Social media connectors</h2><p className="muted">Connect a supported account once, then publish your live listings directly from RentHub. Only owners can publish their own listings.</p>{msg&&<div className="alert">{msg}</div>}<div className="social-connect-grid">{providers.map(p=>{const c=connected(p); return <div className="social-connect" key={p}><strong>{p==='x'?'X':p[0].toUpperCase()+p.slice(1)}</strong>{c?<><span className="muted">Connected as {c.account_name||'account'}</span><a className="btn btn-light" href={`/api/social/${p}/connect`}>Reconnect</a></>:<a className="btn btn-primary" href={`/api/social/${p}/connect`}>Connect</a>}</div>})}</div></section>
}
