import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend }) => {
    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{title}</span>
                {Icon && <Icon size={20} color="var(--accent-color)" />}
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {value}
            </div>

            {trend && (
                <div style={{ fontSize: '0.85rem', color: trend > 0 ? '#30d158' : '#ff453a' }}>
                    {trend > 0 ? '+' : ''}{trend}% from last period
                </div>
            )}
        </div>
    );
};

export default StatsCard;
