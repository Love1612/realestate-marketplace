import "./globals.css";
import Link from "next/link";
import type {Metadata} from "next";
import Brand from "@/components/Brand";

export const metadata: Metadata = {
  title: "RentHub | Find, list, manage and grow",
  description: "A simpler rental marketplace and property marketing platform for renters, owners and property managers.",
  openGraph: {
    title: "RentHub | Find, list, manage and grow",
    description: "A simpler way to find rentals and manage advertised vacancies.",
    type: "website",
    images: [{ url: "/brand/renthub-brand-preview.png", width: 1536, height: 1024, alt: "RentHub rental marketplace and property management platform" }]
  },
  twitter: {
    card: "summary",
    title: "RentHub | Find, list, manage and grow",
    description: "A simpler rental marketplace and property marketing platform."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container nav">
            <Brand />
            <nav className="navlinks" aria-label="Primary navigation">
              <Link href="/listings">Find a rental</Link>
              <Link href="/favorites">Saved</Link>
              <Link href="/saved-searches">Alerts</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/portfolio">Portfolio</Link>
              <Link href="/messages">Messages</Link>
              <Link href="/dashboard">My listings</Link>
              <Link href="/account">Account</Link>
              <Link className="btn btn-primary" href="/listings/new">List a property</Link>
            </nav>
            <details className="mobile-nav">
              <summary aria-label="Open menu">Menu</summary>
              <div className="mobile-nav-panel">
                <Link href="/listings">Find a rental</Link>
                <Link href="/favorites">Saved</Link>
                <Link href="/saved-searches">Alerts</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="/portfolio">Portfolio</Link>
                <Link href="/messages">Messages</Link>
                <Link href="/dashboard">My listings</Link>
                <Link href="/account">Account</Link>
                <Link className="btn btn-primary" href="/listings/new">List a property</Link>
              </div>
            </details>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="container footer-grid">
            <div><Brand compact/><p>Find · List · Manage · Grow</p></div>
            <div><strong>Rent smarter</strong><Link href="/listings">Browse rentals</Link><Link href="/saved-searches">Create an alert</Link></div>
            <div><strong>List smarter</strong><Link href="/listings/new">Create a listing</Link><Link href="/portfolio">Portfolio tools</Link></div>
            <div><strong>Trust</strong><Link href="/legal">Trust & legal</Link><span>Built for simplicity and transparency.</span></div>
          </div>
          <div className="container footer-bottom">© {new Date().getFullYear()} RentHub. Find · List · Manage · Grow.</div>
        </footer>
      </body>
    </html>
  );
}
