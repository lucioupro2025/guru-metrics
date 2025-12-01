import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const ChartCard = ({ title, children }) => {
    const cardRef = useRef(null);

    const handleDownload = async () => {
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, {
                    backgroundColor: '#1c1c1e', // Match theme background
                    scale: 2, // Higher resolution
                });

                const link = document.createElement('a');
                link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_chart.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error('Failed to download chart:', err);
            }
        }
    };

    return (
        <div ref={cardRef} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{title}</h3>
                <button
                    onClick={handleDownload}
                    className="glass-button"
                    style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Download Chart"
                >
                    <Download size={18} />
                </button>
            </div>

            <div style={{ width: '100%', height: '300px' }}>
                {children}
            </div>
        </div>
    );
};

export default ChartCard;
