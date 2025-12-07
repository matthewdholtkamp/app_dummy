export default function Testimonials() {
    const testimonials = [
        {
            quote: "Antigravity completely transformed how we build web apps. It's incredibly fast.",
            author: "Sarah Johnson",
            role: "CTO at TechFlow"
        },
        {
            quote: "The design system is beautiful out of the box. Saved us weeks of development time.",
            author: "Michael Chen",
            role: "Lead Designer at Creative Co"
        },
        {
            quote: "We've seen a 40% increase in conversions since switching to this new landing page.",
            author: "Jessica Davis",
            role: "Marketing Director at ScaleUp"
        }
    ];

    return (
        <section className="testimonials-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Loved by developers</h2>
                    <p className="section-subtitle">Join thousands of teams building with Antigravity</p>
                </div>
                <div className="testimonials-grid">
                    {testimonials.map((t, i) => (
                        <div key={i} className="glass-card">
                            <div className="testimonial-avatar"></div>
                            <p className="testimonial-quote">"{t.quote}"</p>
                            <div>
                                <div className="testimonial-author">{t.author}</div>
                                <div className="testimonial-role">{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
