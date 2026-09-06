import Link from "next/link";
import Brand from "@/components/Brand";

export default function Home() {
  return <>
    <section className="hero hero-home">
      <div className="container hero-grid">
        <div>
          <div className="hero-note">Simple rental search · Straightforward listing tools</div>
          <h1>Find your next place.<br/><span>List it smarter.</span></h1>
          <p>RentHub brings renters, owners and property managers together with a cleaner experience, transparent costs and tools that scale from one property to an entire portfolio.</p>
          <form className="searchbox home-search" action="/listings">
            <input className="input" name="q" placeholder="City, ZIP, neighborhood or property" aria-label="Search rentals" />
            <select className="input" name="property_type" defaultValue=""><option value="">Any property type</option><option value="house">House</option><option value="apartment">Apartment</option><option value="condo">Condo</option><option value="townhome">Townhome</option><option value="room">Room</option><option value="commercial">Commercial</option></select>
            <select className="input" name="bedrooms" defaultValue=""><option value="">Any bedrooms</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select>
            <button className="btn btn-primary" type="submit">Search rentals</button>
          </form>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/listings">Explore rentals</Link>
            <Link className="btn btn-light" href="/listings/new">List a property</Link>
          </div>
          <div className="trust-row"><span>✓ Transparent total cost</span><span>✓ Freshness confirmation</span><span>✓ Direct owner messaging</span></div>
        </div>
        <div className="hero-brand-card">
          <Brand />
          <div className="hero-brand-copy"><strong>More than a rental platform.</strong><span>It’s your rental advantage.</span></div>
          <div className="mini-feature-grid">
            <div><b>Find</b><span>Search + map</span></div><div><b>List</b><span>Simple pricing</span></div>
            <div><b>Manage</b><span>Portfolio tools</span></div><div><b>Grow</b><span>Insights + leads</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-heading"><div><span className="eyebrow">WHY RENTHUB</span><h2>Less friction. More results.</h2></div><p className="muted">Every major workflow is designed to get users from search to decision faster.</p></div>
        <div className="feature-grid">
          <Feature title="Search the way you think" text="Use location, price, bedrooms, property type and map browsing without digging through clutter." icon="⌕" />
          <Feature title="Know the real monthly cost" text="Show rent, recurring fees and key move-in costs clearly so renters can compare apples to apples." icon="$" />
          <Feature title="Trust what you see" text="Freshness confirmations, reporting tools and listing-quality checks help reduce stale or suspicious listings." icon="✓" />
          <Feature title="Message without the runaround" text="Keep conversations and inquiries connected to the property so the next step is obvious." icon="↗" />
          <Feature title="Book the next step" text="Make tour requests and availability part of the listing experience instead of another scavenger hunt." icon="□" />
          <Feature title="Scale from 1 to 500+" text="Owners can start small while property managers get portfolio, community, unit and bulk-management workflows." icon="▦" />
        </div>
      </div>
    </section>

    <section className="section section-dark">
      <div className="container split">
        <div><span className="eyebrow light">FOR OWNERS & MANAGERS</span><h2>One dashboard for every vacancy.</h2><p>Manage advertised vacancies, communities, units, photos, leads, tours, analytics and renewals without rebuilding the same listing over and over.</p><Link className="btn btn-light" href="/portfolio">See portfolio tools</Link></div>
        <div className="advantage-list"><div><strong>01</strong><span>Bulk upload and edit</span></div><div><strong>02</strong><span>Community → unit organization</span></div><div><strong>03</strong><span>Pricing and performance insights</span></div><div><strong>04</strong><span>Syndication-ready data</span></div></div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-heading"><div><span className="eyebrow">BUILT FOR BOTH SIDES</span><h2>Simple enough to use. Powerful enough to keep.</h2></div></div>
        <div className="audience-grid">
          <div className="panel audience-card"><span className="audience-kicker">RENTER</span><h3>Find with confidence</h3><p className="muted">Map search, favorites, alerts, transparent costs, messaging and tour requests in one place.</p><Link className="btn btn-secondary" href="/listings">Start searching</Link></div>
          <div className="panel audience-card"><span className="audience-kicker">OWNER</span><h3>List without the headache</h3><p className="muted">A simple paid listing model, clear tiers, photos, inquiries, renewals and performance tools.</p><Link className="btn btn-secondary" href="/listings/new">Create a listing</Link></div>
          <div className="panel audience-card"><span className="audience-kicker">MANAGER</span><h3>Run the portfolio</h3><p className="muted">Active-vacancy billing, communities, units, bulk tools, exports and analytics built for growth.</p><Link className="btn btn-secondary" href="/portfolio">Manage a portfolio</Link></div>
        </div>
      </div>
    </section>

    <section className="section section-cta"><div className="container panel cta"><div><Brand compact/><h2>Ready to make renting simpler?</h2><p className="muted">Find a rental or put your next vacancy in front of the right people.</p></div><div className="hero-actions"><Link className="btn btn-primary" href="/listings">Find a rental</Link><Link className="btn btn-light" href="/listings/new">List a property</Link></div></div></section>
  </>;
}

function Feature({title,text,icon}:{title:string;text:string;icon:string}) {
  return <div className="feature-card"><div className="feature-icon">{icon}</div><div><h3>{title}</h3><p className="muted">{text}</p></div></div>;
}
