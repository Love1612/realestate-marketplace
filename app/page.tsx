import Link from "next/link";

export default function Home() {
  return <>
    <section className="hero"><div className="container">
      <h1>Renting should be<br />simple.</h1>
      <p>Find a home, room, land, parking space, or commercial property without the clutter. Owners get one simple price: <strong>$5 for 30 days.</strong></p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:25}}>
        <Link className="btn btn-primary" href="/listings">Find a rental</Link>
        <Link className="btn btn-light" href="/listings/new">List a property · $5</Link>
      </div>
    </div></section>
    <section className="section"><div className="container">
      <h2>Everything in one place</h2>
      <div className="grid">
        <div className="card"><div className="card-body"><h3>🔎 Search easily</h3><p className="muted">Filter by location, rent, property type, and bedrooms so you can get to the right listings faster.</p></div></div>
        <div className="card"><div className="card-body"><h3>♥ Save favorites</h3><p className="muted">Save promising rentals and come back to compare them later.</p></div></div>
        <div className="card"><div className="card-body"><h3>💬 Talk directly</h3><p className="muted">Send the property owner a message when you find a place you like.</p></div></div>
      </div>
    </div></section>
    <section className="section" style={{paddingTop:0}}><div className="container"><div className="panel">
      <h2 style={{marginBottom:8}}>For property owners</h2><p className="muted">No percentage of rent. No complicated pricing. Publish for $5, manage your listing for 30 days, and renew when you need another 30 days.</p>
      <Link className="btn btn-primary" href="/listings/new">Create a listing</Link>
    </div></div></section>
  </>;
}