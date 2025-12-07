import { ArrowRight } from 'lucide-react';

export default function CallToAction() {
    return (
        <section className="cta-section">
            <div className="container">
                <div className="cta-inner">
                    <h2 className="section-title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                        Ready to get started?
                    </h2>
                    <p className="section-subtitle" style={{ marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Join the community of developers building the future today. It's free to get started.
                    </p>
                    <button className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        Start Building Now <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            </div>
        </section>
    );
}
