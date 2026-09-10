// Libraries
import { BriefcaseBusiness, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

// Styles
import '../assets/styles/landing.css'

// Images
const assets = {
  hero: 'https://images.unsplash.com/photo-1666689468289-bd7ae53d5ba9?auto=format&fit=crop&w=1800&q=86',
  destination: 'https://images.unsplash.com/photo-1500120194857-62b493650979?auto=format&fit=crop&w=1800&q=86',
  journal: 'https://images.unsplash.com/photo-1724739541524-dd6ee3fc7ff9?auto=format&fit=crop&w=1800&q=86',
}

// Vendor and administrator landing page
export default function Landing() {
  return (
    <div className="landing partner-landing">
      <nav className="nav" aria-label="Main navigation">
        <Link className="brand" to="/">Xenon</Link>
        <div className="nav-links">
          <a href="#vendors">For vendors</a>
          <a href="#administrators">For admins</a>
          <span className="nav-divider" />
          <Link className="portal-access" to="/login">Portal access</Link>
        </div>
      </nav>
      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">XENON · PARTNER &amp; ADMIN PORTAL</span>
            <h1>Local expertise.<br />Exceptional journeys.</h1>
            <p>A dedicated workspace for the people behind Jordan’s travel experiences. Manage your business, support your travellers, and keep every detail in view.</p>
            <div className="portal-audiences" aria-label="Portal account types"><span>Vendors</span><span>Administrators</span></div>
          </div>
          <div className="hero-image" style={{ backgroundImage: `url(${assets.hero})` }} role="img" aria-label="Wadi Rum desert landscape in Jordan" />
        </section>
        <section className="journey" aria-labelledby="workspace-heading">
          <div className="workspace-intro"><span className="eyebrow">BUILT FOR THE PEOPLE BEHIND THE JOURNEY</span><h2 id="workspace-heading">Your work, thoughtfully connected.</h2><p>Two dedicated workspaces. One shared commitment to better travel in Jordan.</p></div>
          <div className="bento">
            <article className="bento-card large photo-card" style={{ backgroundImage: `url(${assets.destination})` }}>
              <div className="photo-content"><span className="card-kicker">PETRA · JORDAN</span><h3>Rooted in local knowledge</h3><p>Bring Jordan’s places and experiences to life through the people who know them best.</p></div>
            </article>
            <article className="bento-card workspace-card" id="vendors">
              <span className="workspace-icon"><BriefcaseBusiness size={24} aria-hidden="true" /></span>
              <span className="workspace-kicker">FOR VENDORS</span>
              <h3>Your business workspace</h3>
              <p>Manage packages, booking requests, payments, and your team from one place.</p>
              <span className="workspace-note">New partner? Register through Portal access.</span>
            </article>
            <article className="bento-card workspace-card admin-workspace" id="administrators">
              <span className="workspace-icon"><ShieldCheck size={24} aria-hidden="true" /></span>
              <span className="workspace-kicker">FOR ADMINISTRATORS</span>
              <h3>A clear view of the platform</h3>
              <p>Review vendor applications, oversee platform activity, and resolve reports and feedback.</p>
              <span className="workspace-note">Access for existing administrator accounts.</span>
            </article>
            <article className="bento-card large photo-card" style={{ backgroundImage: `url(${assets.journal})` }}>
              <div className="photo-content"><span className="card-kicker">WADI RUM · JORDAN</span><h3>Better experiences, together</h3><p>Supporting local hosts, guides, and the teams who make each journey possible.</p></div>
            </article>
          </div>
        </section>
      </main>
      <footer className="footer">
        <span className="serif" style={{ fontSize: 20 }}>Xenon</span>
        <div className="footer-links"><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link><a href="mailto:support@xenon.example">Contact Support</a></div>
        <span>© 2026 Xenon · Vendor &amp; Admin Portal</span>
      </footer>
    </div>
  )
}
