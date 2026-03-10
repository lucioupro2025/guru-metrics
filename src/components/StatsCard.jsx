import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, trend, trendText }) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-panel"
            style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minWidth: '200px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>{title}</span>
                <div style={{
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'rgba(0, 118, 255, 0.1)',
                    color: 'var(--accent-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {Icon && <Icon size={20} />}
                </div>
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    {value}
                </motion.span>
            </div>

            {trend !== undefined && (
                <div style={{
                    fontSize: '0.9rem',
                    color: trend >= 0 ? '#30d158' : '#ff453a',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{
                        background: trend >= 0 ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 69, 58, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        {trend > 0 ? '↑' : (trend < 0 ? '↓' : '●')} {trend !== 0 && `${Math.abs(trend)}${trendText?.includes('%') || typeof trend === 'number' && trendText === undefined ? '%' : ''}`}
                        {trend === 0 && (trendText?.includes('%') || trendText === undefined ? '0%' : '')}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{trendText || 'vs anterior'}</span>
                </div>
            )}
        </motion.div>
    );
};

export default StatsCard;
