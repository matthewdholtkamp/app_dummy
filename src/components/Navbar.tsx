export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <div className="navbar-logo">
                    <div className="logo-icon"></div>
                    Antigravity
                </div>
                <div className="navbar-links">
                    <a href="#features" className="nav-link">Features</a>
                    <a href="#about" className="nav-link">About</a>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Sign In</button>
                </div>
            </div>
        </nav>
    );
}
