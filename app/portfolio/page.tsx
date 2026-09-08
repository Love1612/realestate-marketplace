"use client"; import {useEffect,useState} from 'react';
export default function Portfolio(){
  const [d,setD]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [file,setFile]=useState<File|null>(null);
  const [tier,setTier]=useState('10');
  const [pack,setPack]=useState('b8');
  async function load(){const r=await fetch('/api/portfolio');if(r.ok)setD(await r.json());setLoading(false)}
  useEffect(()=>{load()},[]);
  async function importCsv(){if(!file)return;const f=new FormData();f.append('file',file);const r=await fetch('/api/bulk-import',{method:'POST',body:f});const x=await r.json();alert(`Imported ${x.created?.length||0} listings. ${x.errors?.length||0} rows need review.`);load()}
  async function subscribe(){const r=await fetch('/api/portfolio/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tier})});const x=await r.json();if(r.ok)window.location.href=x.checkout_url;else alert(x.error||'Could not start checkout.')}
  async function buyBuilding(){const r=await fetch('/api/portfolio/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'building',tier:pack})});const x=await r.json();if(r.ok)window.location.href=x.checkout_url;else alert(x.error||'Could not start checkout.')}
  async function exportFeed(){const r=await fetch('/api/feed-export');const x=await r.json();const blob=new Blob([JSON.stringify(x,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='renthub-syndication-feed.json';a.click()}
  if(loading)return <main className="section"><div className="container">Loading portfolio…</div></main>;
  return <main className="section"><div className="container">
    <h1>{d?.organization?.name||'Portfolio'}</h1>
    <p className="muted">Manage vacancies for one apartment building or a whole portfolio. You only pay for units you advertise.</p>
    <div className="grid">
      <div className="panel"><strong>Plan</strong><h2>{d?.billing?.tier||'10'} active listings</h2><p className="muted">{d?.billing?.active_listings_limit||10} active listings included.</p></div>
      <div className="panel"><strong>Active listings</strong><h2>{(d?.listings||[]).filter((x:any)=>x.status==='live').length}</h2><p className="muted">Only advertised vacancies count toward capacity.</p></div>
      <div className="panel"><strong>Communities</strong><h2>{d?.communities?.length||0}</h2><p className="muted">One community = one building or property.</p></div>
    </div>
    <div className="panel" style={{marginTop:20}}>
      <h2>Apartment building pack</h2>
      <p className="muted">30 days. Bulk price for vacant units at one building. Occupied apartments do not count.</p>
      <div className="dashboard-actions">
        <select className="input" value={pack} onChange={e=>setPack(e.target.value)}>
          <option value="b4">4 vacancies · $16 / 30 days</option>
          <option value="b8">8 vacancies · $28 / 30 days</option>
          <option value="b16">16 vacancies · $48 / 30 days</option>
          <option value="b32">32 vacancies · $80 / 30 days</option>
        </select>
        <button className="btn btn-primary" onClick={buyBuilding}>Buy building pack</button>
      </div>
    </div>
    <div className="panel" style={{marginTop:20}}>
      <h2>Portfolio billing</h2>
      <p className="muted">Monthly capacity if you advertise vacancies across more than one building.</p>
      <div className="dashboard-actions">
        <select className="input" value={tier} onChange={e=>setTier(e.target.value)}>
          <option value="10">10 active · $35/mo</option>
          <option value="25">25 active · $70/mo</option>
          <option value="50">50 active · $140/mo</option>
          <option value="100">100 active · $225/mo</option>
          <option value="250">250 active · $450/mo</option>
        </select>
        <button className="btn btn-primary" onClick={subscribe}>Choose portfolio plan</button>
      </div>
    </div>
    <div className="panel" style={{marginTop:20}}>
      <h2>Bulk tools</h2>
      <p className="muted">Import up to 250 listings from CSV. Export a clean feed for future syndication partners.</p>
      <input type="file" accept=".csv,text/csv" onChange={e=>setFile(e.target.files?.[0]||null)}/>
      <div className="dashboard-actions" style={{marginTop:10}}>
        <button className="btn btn-primary" onClick={importCsv}>Import CSV</button>
        <button className="btn btn-secondary" onClick={exportFeed}>Export syndication feed</button>
      </div>
    </div>
    <h2 style={{marginTop:28}}>Communities</h2>
    <div className="grid">{(d?.communities||[]).map((c:any)=><div className="card" key={c.id}><div className="card-body"><h3>{c.name}</h3><p className="muted">{c.city}, {c.state} · {c.total_units} units</p></div></div>)}</div>
    <h2 style={{marginTop:28}}>Listings</h2>
    <div className="grid">{(d?.listings||[]).map((l:any)=><div className="panel" key={l.id}><strong>{l.title}</strong><div className="muted">{l.city}, {l.state} · ${Number(l.monthly_rent).toLocaleString()}/mo · {l.plan}</div><div style={{marginTop:8}}>{l.verification_status==='owner_confirmed'?'✓ Owner confirmed':'Needs confirmation'}</div></div>)}</div>
  </div></main>;
}
