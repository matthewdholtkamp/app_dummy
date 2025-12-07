import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
    return (
        <section className="hero">
            <div className="container hero-content">
                <div className="hero-inner">
                    <div className="animate-fade-in hero-badge">
                        <Sparkles size={16} />
                        <span>v2.0 is now available</span>
                    </div>

                    <h1 className="animate-fade-in delay-100 hero-title">
                        Build the future <br />
                        <span className="text-gradient">at lightspeed</span>
                    </h1>

                    <p className="animate-fade-in delay-200 hero-description">
                        Experience the next generation of web development. Fast, secure, and beautiful by default.
                    </p>

                    <div className="animate-fade-in delay-300 hero-buttons">
                        <button className="btn btn-primary">
                            Get Started <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                        </button>
                        <button className="btn btn-secondary">
                            View Documentation
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
