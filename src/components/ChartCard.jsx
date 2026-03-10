import React, { useRef } from 'react';
import { Download, MoreHorizontal } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';

const ChartCard = ({ title, children, subtitle }) => {
    const cardRef = useRef(null);

    const handleDownload = async () => {
        if (cardRef.current) {
            try {
                // Temporarily remove internal shadows/borders for cleaner export
                const canvas = await html2canvas(cardRef.current, {
                    backgroundColor: '#050505',
                    scale: 3,
                    logging: false,
                    useCORS: true
                });

                const link = document.createElement('a');
                link.download = `guru_metrics_${title.replace(/\s+/g, '_').toLowerCase()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error('Failed to download chart:', err);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={cardRef}
            className="glass-panel"
            style={{
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</h3>
                    {subtitle && <p style={{ fontSize: '0.85rem', margin: 0 }}>{subtitle}</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleDownload}
                        className="glass-button secondary-button"
                        style={{ padding: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Exportar como Imagen"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        className="glass-button secondary-button"
                        style={{ padding: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            <div style={{ width: '100%', height: '350px', marginTop: 'auto' }}>
                {children}
            </div>
        </motion.div>
    );
};

export default ChartCard;
