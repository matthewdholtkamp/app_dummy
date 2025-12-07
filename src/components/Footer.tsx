export default function Footer() {
    return (
        <footer className="main-footer">
            <div className="container footer-content">
                <p className="footer-copy">
                    &copy; {new Date().getFullYear()} Antigravity Inc. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
