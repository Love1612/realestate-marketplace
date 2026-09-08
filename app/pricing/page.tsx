import Link from 'next/link';
import {BUILDING_BULK_PACKS, PORTFOLIO_TIERS} from '@/lib/pricing';

export default function Pricing(){
  return <main className="section"><div className="container">
    <h1>Simple pricing</h1>
    <p className="muted">Start with photos. Single units are $5. Apartment buildings get a bulk pack so you only pay for vacant units you are advertising — not every door in the building.</p>

    <h2 style={{marginTop:30}}>One unit</h2>
    <div className="grid">
      <div className="card"><div className="card-body">
        <span className="badge">Single listing</span>
        <h3>$5 / 30 days</h3>
        <p className="muted">Photos, address, rent, and 30 days live. No Featured or Premium add-ons.</p>
        <Link className="btn btn-primary" href="/listings/new">List one property</Link>
      </div></div>
    </div>

    <h2 style={{marginTop:36}}>Apartment buildings</h2>
    <p className="muted">One address, several open units. Bulk price covers advertised vacancies for 30 days. Occupied units do not count.</p>
    <div className="grid">{BUILDING_BULK_PACKS.map(p=>(
      <div className="card" key={p.tier}><div className="card-body">
        <span className="badge">{p.label}</span>
        <h3>{p.units} vacant units</h3>
        <div className="price">{p.price===null ? 'Custom' : `$${p.price} / 30 days`}</div>
        {p.perUnit ? <p className="muted">About ${p.perUnit} per vacant unit</p> : null}
        <p className="muted">{p.blurb}</p>
        <Link className="btn btn-primary" href={p.price===null ? '/portfolio' : `/portfolio?pack=${p.tier}`}>
          {p.price===null ? 'Talk to RentHub' : 'Get this building pack'}
        </Link>
      </div></div>
    ))}</div>

    <h2 style={{marginTop:36}}>Many buildings / portfolios</h2>
    <p className="muted">Monthly capacity if you manage vacancies across more than one property.</p>
    <div className="grid">{PORTFOLIO_TIERS.map(t=><div className="card" key={t.tier}><div className="card-body"><h3>{t.listings} active listings</h3><div className="price">{t.price===null?'Custom':`$${t.price}/mo`}</div><p className="muted">Across your whole portfolio. Only advertised vacancies count.</p><Link className="btn btn-secondary" href="/portfolio">Manage portfolio</Link></div></div>)}</div>
  </div></main>;
}
