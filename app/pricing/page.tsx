import Link from 'next/link';
import {PORTFOLIO_TIERS} from '@/lib/pricing';
export default function Pricing(){
  return <main className="section"><div className="container">
    <h1>Simple pricing</h1>
    <p className="muted">We’re just starting. A listing is photos plus the basics for $5. No Featured or Premium add-ons yet.</p>
    <h2 style={{marginTop:30}}>Single listings</h2>
    <div className="grid">
      <div className="card"><div className="card-body">
        <span className="badge">Listing</span>
        <h3>$5 / 30 days</h3>
        <p className="muted">Photos, details, and 30 days live. That’s it for now.</p>
        <Link className="btn btn-primary" href="/listings/new">List a property</Link>
      </div></div>
    </div>
    <h2 style={{marginTop:36}}>Portfolio tiers</h2>
    <div className="grid">{PORTFOLIO_TIERS.map(t=><div className="card" key={t.tier}><div className="card-body"><h3>{t.listings}+ active listings</h3><div className="price">{t.price===null?'Custom':`$${t.price}/mo`}</div><p className="muted">For later, when you have more vacancies to manage.</p><Link className="btn btn-secondary" href="/portfolio">Manage portfolio</Link></div></div>)}</div>
  </div></main>;
}
