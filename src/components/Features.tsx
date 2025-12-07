import React from 'react';
import { Zap, Shield, Globe } from 'lucide-react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="glass-card">
            <div className="feature-icon-wrapper">
                {icon}
            </div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-description">{description}</p>
        </div>
    );
}

export default function Features() {
    const features = [
        {
            icon: <Zap size={24} />,
            title: "Lightning Fast",
            description: "Optimized for speed with zero-config builds and instant HMR. Experience the difference."
        },
        {
            icon: <Shield size={24} />,
            title: "Secure by Design",
            description: "Enterprise-grade security built directly into the core using best-in-class encryption."
        },
        {
            icon: <Globe size={24} />,
            title: "Global Edge",
            description: "Deploy instantly to a global network of edge locations for low latency everywhere."
        }
    ];

    return (
        <section id="features" className="features-section">
            <div className="container">
                <div className="features-grid">
                    {features.map((f, i) => (
                        <FeatureCard key={i} {...f} />
                    ))}
                </div>
            </div>
        </section>
    );
}
