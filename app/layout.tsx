import "./globals.css";
import Link from "next/link";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "RentHub | Find or list a rental",
  description: "Simple rental listings. Owners pay $5 for 30 days, and RentHub does not take a percentage of rent.",
  openGraph: {
    title: "RentHub | Find or list a rental",
    description: "Find rentals or list a property for $5 for 30 days.",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "RentHub | Find or list a rental",
    description: "Find rentals or list a property for $5 for 30 days."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container nav">
            <Link className="brand" href="/">Rent<span>Hub</span></Link>
            <nav className="navlinks">
              <Link href="/listings">Find a rental</Link>
              <Link href="/favorites">Saved</Link>
              <Link href="/messages">Messages</Link>
              <Link href="/dashboard">My listings</Link>
              <Link href="/account">Account</Link><Link href="/legal">Trust & legal</Link>
              <Link className="btn btn-primary" href="/listings/new">List a property · $5</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="container">RentHub · Simple rental listings with no percentage taken from your rent.</div>
        </footer>
      </body>
    </html>
  );
}