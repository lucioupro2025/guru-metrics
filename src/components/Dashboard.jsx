import React, { useMemo, useState } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
    ComposedChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, BarChart3, PieChart as PieIcon, RefreshCw,
    Calendar, TrendingUp, TrendingDown, Layers,
    ArrowLeft, Filter, Download, Zap
} from 'lucide-react';
import StatsCard from './StatsCard';
import ChartCard from './ChartCard';

const COLORS = ['#0076ff', '#30d158', '#bf5af2', '#ff9f0a', '#ff453a', '#64d2ff'];

const Dashboard = ({ data, onReset }) => {
    const [view, setView] = useState('overview'); // overview, table

    // Advanced Data Analysis
    const analytics = useMemo(() => {
        if (!data) return null;

        if (data.type === 'caja_report') {
            const totalRows = data.orders.length;
            const totalValue = data.totalVentasBrutas || 0;
            const avgValueFromMetrics = data.metrics?.['Ticket Promedio'] || data.metrics?.['Ticket Promedio'] || (totalValue / (totalRows || 1)).toString();
            const totalProducts = data.metrics?.['Total Productos Vendidos'] || data.metrics?.['Total Productos Vendidos'] || '0';

            return {
                isCajaReport: true,
                numCols: ['Monto'],
                catCols: ['Metodo'],
                dateCols: [],
                stats: {
                    totalRows,
                    totalValue: totalValue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }).split(',')[0],
                    avgValue: (parseFloat(avgValueFromMetrics) || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }).split(',')[0],
                    totalProducts,
                    mainNumCol: 'Monto',
                    trend: 0
                },
                payments: data.payments,
                arqueo: data.arqueo,
                ranking: data.ranking,
                orders: data.orders,
                metrics: data.metrics,
                info: data.info
            };
        }

        if (!Array.isArray(data) || data.length === 0) return null;

        const firstRow = data[0];
        const numCols = [];
        const catCols = [];
        const dateCols = [];

        // Helper to clean numeric strings like "$5.000,00"
        const cleanNumber = (val) => {
            if (typeof val === 'number') return val;
            if (typeof val !== 'string') return NaN;
            return parseFloat(val.replace(/[^\d.-]/g, ''));
        };

        const idLikePatterns = [/id/i, /cae/i, /factura/i, /numero/i, /código/i, /zip/i, /phone/i, /teléfono/i, /cuit/i, /cuil/i, /dni/i];

        Object.keys(firstRow).forEach(key => {
            const value = firstRow[key];
            const cleanedVal = cleanNumber(value);

            // Check if it's a date first
            if (typeof value === 'string' && (value.match(/^\d{2,4}[-/]\d{2}[-/]\d{2,4}/) || !isNaN(Date.parse(value)))) {
                dateCols.push(key);
                return;
            }

            // Exclude ID-like columns from numerical analysis even if they contain numbers
            const isIdLike = idLikePatterns.some(pattern => pattern.test(key));

            if (!isNaN(cleanedVal) && !isIdLike) {
                numCols.push(key);
            } else {
                catCols.push(key);
            }
        });

        const totalRows = data.length;
        const mainNumCol = numCols[0];

        const totalValue = mainNumCol ? data.reduce((sum, row) => sum + (cleanNumber(row[mainNumCol]) || 0), 0) : 0;
        const avgValue = mainNumCol ? (totalValue / totalRows).toFixed(2) : 0;

        // Find growth
        const half = Math.floor(data.length / 2);
        const firstHalf = data.slice(0, half);
        const secondHalf = data.slice(half);
        const firstSum = mainNumCol ? firstHalf.reduce((sum, row) => sum + (cleanNumber(row[mainNumCol]) || 0), 0) : 1;
        const secondSum = mainNumCol ? secondHalf.reduce((sum, row) => sum + (cleanNumber(row[mainNumCol]) || 0), 0) : 1;
        const trend = (((secondSum - firstSum) / (firstSum || 1)) * 100).toFixed(1);

        return {
            isCajaReport: false,
            numCols,
            catCols,
            dateCols,
            stats: {
                totalRows,
                totalValue: totalValue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }).split(',')[0],
                avgValue: Number(avgValue).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }).split(',')[0],
                mainNumCol,
                trend: parseFloat(trend)
            }
        };
    }, [data]);

    // Data for Distribution (Top Categories)
    const pieData = useMemo(() => {
        if (!analytics) return [];

        if (analytics.isCajaReport) {
            return analytics.payments.map(p => ({
                name: p.metodo,
                value: p.total
            }));
        }

        if (analytics.catCols.length === 0) return [];
        const catCol = analytics.catCols[0];
        const counts = {};
        data.forEach(row => {
            const val = row[catCol] || 'Desconocido';
            counts[val] = (counts[val] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name: String(name), value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [data, analytics]);

    // Radar Data
    const radarData = useMemo(() => {
        if (!analytics) return [];

        if (analytics.isCajaReport) {
            // For Caja Report, we can use ranking
            return analytics.ranking.map(r => ({
                subject: r.producto,
                [analytics.numCols[0]]: r.recaudacion,
                'Cantidad': r.cantidad
            }));
        }

        if (analytics.numCols.length < 1 || analytics.catCols.length < 1) return [];
        const topCats = pieData.map(d => d.name);
        return topCats.map(cat => {
            const items = data.filter(d => d[analytics.catCols[0]] === cat);
            const obj = { subject: cat };
            analytics.numCols.slice(0, 2).forEach(col => {
                const cleanNumber = (val) => {
                    if (typeof val === 'number') return val;
                    return parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0;
                };
                obj[col] = items.reduce((sum, row) => sum + (cleanNumber(row[col]) || 0), 0) / (items.length || 1);
            });
            return obj;
        });
    }, [data, analytics, pieData]);

    // Data for Mostrador vs Delivery
    const clientData = useMemo(() => {
        if (!analytics || !analytics.isCajaReport) return [];

        let mostradorCount = 0;
        let deliveryCount = 0;

        analytics.orders.forEach(order => {
            const cliente = String(order.Cliente || '').trim().toLowerCase();
            if (cliente === 'mostrador' || cliente === '') {
                mostradorCount++;
            } else {
                // If it has a specific name, we assume it's Delivery
                deliveryCount++;
            }
        });

        return [
            { tipo: 'Mostrador', cantidad: mostradorCount },
            { tipo: 'Delivery', cantidad: deliveryCount }
        ];
    }, [data, analytics, pieData]);

    const tooltipStyle = {
        contentStyle: { backgroundColor: '#1e1e1e', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff' },
        itemStyle: { color: '#e0e0e0', fontWeight: 500 },
        cursor: { fill: 'rgba(255,255,255,0.05)' }
    };

    const mainData = useMemo(() => {
        if (!data) return [];
        return data.type === 'caja_report' ? data.orders : data;
    }, [data]);

    if (!data || (Array.isArray(data) && data.length === 0)) return null;

    return (
        <div className="dashboard-container">
            {/* Action Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '40px'
                }}
            >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button onClick={onReset} className="glass-button secondary-button" style={{ padding: '10px' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{analytics.isCajaReport ? 'Reporte de Caja' : 'Análisis de Datos'}</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {analytics.isCajaReport && analytics.info?.['Periodo de Caja'] && (
                                <span style={{ marginRight: '12px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                                    <Calendar size={12} style={{ display: 'inline', marginRight: '6px', relativeTop: '2px' }} />
                                    {analytics.info['Periodo de Caja'].split(' hasta ')[0].split(',')[0]} {/* Simplifying the date string */}
                                </span>
                            )}
                            Análisis en tiempo real de {analytics.stats.totalRows} pedidos
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className={`glass-button ${view === 'overview' ? '' : 'secondary-button'}`}
                        onClick={() => setView('overview')}
                    >
                        <Zap size={16} /> Resumen
                    </button>
                    <button
                        className={`glass-button ${view === 'table' ? '' : 'secondary-button'}`}
                        onClick={() => setView('table')}
                    >
                        <Layers size={16} /> Tabla de Datos
                    </button>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {view === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Summary Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '24px',
                            marginBottom: '40px'
                        }}>
                            <StatsCard
                                title="Registros Totales"
                                value={analytics.stats.totalRows}
                                icon={Activity}
                                trend={analytics.isCajaReport ? 0 : 8.4}
                            />
                            {analytics.numCols.length > 0 && (
                                <>
                                    <StatsCard
                                        title={analytics.isCajaReport ? "Recaudación Total" : `${analytics.stats.mainNumCol} Acumulado`}
                                        value={analytics.stats.totalValue}
                                        icon={analytics.stats.trend > 0 ? TrendingUp : TrendingDown}
                                        trend={analytics.stats.trend}
                                    />
                                    <StatsCard
                                        title={analytics.isCajaReport ? "Ticket Promedio" : `Promedio ${analytics.stats.mainNumCol}`}
                                        value={analytics.stats.avgValue}
                                        icon={BarChart3}
                                    />
                                </>
                            )}
                            {analytics.isCajaReport && analytics.stats.totalProducts !== '0' && (
                                <StatsCard
                                    title="Productos Vendidos"
                                    value={analytics.stats.totalProducts}
                                    icon={Layers}
                                />
                            )}
                            {analytics.isCajaReport && analytics.arqueo && (
                                <StatsCard
                                    title="Diferencia de Caja"
                                    value={!analytics.arqueo.Diferencia && analytics.arqueo.Diferencia !== 0 ? "N/A" : (analytics.arqueo.Diferencia === 0 ? "$0" : `$${analytics.arqueo.Diferencia}`)}
                                    icon={RefreshCw}
                                    trend={analytics.arqueo.Diferencia > 0 ? 1 : (analytics.arqueo.Diferencia < 0 ? -1 : 0)}
                                    trendText={analytics.arqueo.Diferencia === 0 ? "Caja Cuadrada" : (analytics.arqueo.Diferencia > 0 ? "Sobrante" : "Faltante")}
                                />
                            )}
                        </div>

                        {/* Visualizations Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
                            gap: '30px'
                        }}>

                            {/* Distribution Pie */}
                            {pieData.length > 0 && (
                                <ChartCard
                                    title="Distribución Categórica"
                                    subtitle={`Análisis por ${analytics.catCols[0]}`}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={110}
                                                paddingAngle={8}
                                                dataKey="value"
                                                animationBegin={200}
                                                animationDuration={1500}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                        stroke="none"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip {...tooltipStyle} />
                                            <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            )}

                            {/* Main Trend Chart */}
                            {analytics.numCols.length > 0 && (
                                <ChartCard
                                    title={analytics.isCajaReport ? "Detalle de Ventas" : `Evolución de ${analytics.numCols[0]}`}
                                    subtitle={analytics.isCajaReport ? "Monto por cada pedido realizado" : "Progresión temporal y análisis de volumen"}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mainData.slice(0, 50).map(row => ({
                                            ...row,
                                            [analytics.numCols[0]]: parseFloat(String(row[analytics.numCols[0]]).replace(/[^\d.-]/g, '')) || 0
                                        }))}>
                                            <defs>
                                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0076ff" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#0076ff" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey={analytics.dateCols[0] || analytics.catCols[0] || 'index'}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                                            />
                                            <Tooltip {...tooltipStyle} />
                                            <Area
                                                type="monotone"
                                                dataKey={analytics.numCols[0]}
                                                stroke="#0076ff"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorVal)"
                                                animationDuration={2000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            )}

                            {/* Comparison Radar */}
                            {radarData.length > 0 && (
                                <ChartCard
                                    title={analytics.isCajaReport ? "Ranking de Productos" : "Análisis Multidimensional"}
                                    subtitle={analytics.isCajaReport ? "Volumen de ventas por producto" : "Comparativa estructural de categorías principales"}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        {analytics.isCajaReport ? (
                                            <BarChart layout="vertical" data={analytics.ranking.sort((a,b) => b.cantidad - a.cantidad).slice(0, 10)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                                                <YAxis type="category" dataKey="producto" width={150} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                                                <Tooltip {...tooltipStyle} />
                                                <Bar dataKey="cantidad" fill="#bf5af2" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        ) : (
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                                <Radar
                                                    name={analytics.numCols[0]}
                                                    dataKey={analytics.numCols[0]}
                                                    stroke="#bf5af2"
                                                    fill="#bf5af2"
                                                    fillOpacity={0.6}
                                                    animationDuration={2000}
                                                />
                                                {!analytics.isCajaReport && analytics.numCols.length > 1 && (
                                                    <Radar
                                                        name={analytics.numCols[1]}
                                                        dataKey={analytics.numCols[1]}
                                                        stroke="#0076ff"
                                                        fill="#0076ff"
                                                        fillOpacity={0.6}
                                                        animationDuration={2000}
                                                    />
                                                )}
                                                <Legend />
                                                <Tooltip {...tooltipStyle} cursor={false} />
                                            </RadarChart>
                                        )}
                                    </ResponsiveContainer>
                                </ChartCard>
                            )}

                            {/* Composed Volume Chart */}
                            {analytics.numCols.length > 0 && (
                                <ChartCard
                                    title={analytics.isCajaReport ? "Tipos de Venta (Clientes)" : "Volumen y Densidad"}
                                    subtitle={analytics.isCajaReport ? "Pedidos en Mostrador vs Delivery" : "Correlación de métricas secundarias"}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        {analytics.isCajaReport ? (
                                            <BarChart data={clientData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="tipo" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                                <Tooltip {...tooltipStyle} />
                                                <Bar dataKey="cantidad" name="Cantidad de Pedidos" fill="#64d2ff" radius={[6, 6, 0, 0]} barSize={50} />
                                            </BarChart>
                                        ) : (
                                            <ComposedChart data={mainData.slice(0, 30).map(row => {
                                                const clean = (v) => parseFloat(String(v).replace(/[^\d.-]/g, '')) || 0;
                                                const obj = { ...row };
                                                analytics.numCols.forEach(c => obj[c] = clean(row[c]));
                                                return obj;
                                            })}>
                                                <XAxis
                                                    dataKey={analytics.catCols[0] || 'index'}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                                                />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                                                <Tooltip {...tooltipStyle} />
                                                <Legend />
                                                <Bar dataKey={analytics.numCols[0]} fill="#ff9f0a" radius={[10, 10, 0, 0]} barSize={40} />
                                                {analytics.numCols.length > 1 && (
                                                    <Line type="monotone" dataKey={analytics.numCols[1]} stroke="#30d158" strokeWidth={2} dot={{ r: 4 }} />
                                                )}
                                            </ComposedChart>
                                        )}
                                    </ResponsiveContainer>
                                </ChartCard>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-panel"
                        style={{ padding: '32px', overflowX: 'auto' }}
                    >
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    {Object.keys(mainData[0] || {}).map(key => (
                                        <th key={key} style={{ padding: '16px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {mainData.slice(0, 50).map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} style={{ padding: '16px', fontSize: '0.9rem' }}>
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {mainData.length > 50 && (
                            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                                Mostrando los primeros 50 de {mainData.length} registros.
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
