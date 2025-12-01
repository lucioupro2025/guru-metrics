import React, { useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Activity, BarChart2, PieChart as PieIcon, RefreshCw } from 'lucide-react';
import StatsCard from './StatsCard';
import ChartCard from './ChartCard';

const COLORS = ['#0a84ff', '#30d158', '#bf5af2', '#ff9f0a', '#ff453a', '#64d2ff'];

const Dashboard = ({ data, onReset }) => {
    // Analyze data to find numerical and categorical columns
    const { numericalColumns, categoricalColumns, stats } = useMemo(() => {
        if (!data || data.length === 0) return { numericalColumns: [], categoricalColumns: [], stats: {} };

        const firstRow = data[0];
        const numCols = [];
        const catCols = [];

        Object.keys(firstRow).forEach(key => {
            const value = firstRow[key];
            if (typeof value === 'number') {
                numCols.push(key);
            } else {
                catCols.push(key);
            }
        });

        // Calculate basic stats
        const totalRows = data.length;
        const firstNumCol = numCols[0];
        const totalValue = firstNumCol ? data.reduce((sum, row) => sum + (row[firstNumCol] || 0), 0) : 0;
        const avgValue = firstNumCol ? (totalValue / totalRows).toFixed(2) : 0;

        return {
            numericalColumns: numCols,
            categoricalColumns: catCols,
            stats: { totalRows, totalValue, avgValue, firstNumCol }
        };
    }, [data]);

    // Prepare data for charts (limit to first 50 rows for performance if needed, or aggregate)
    // For this MVP, we'll use the raw data but maybe slice it if it's too large for rendering
    const chartData = useMemo(() => {
        return data.slice(0, 100); // Limit to 100 points for smooth rendering
    }, [data]);

    // Pie chart data (distribution of first categorical column, top 5)
    const pieData = useMemo(() => {
        if (categoricalColumns.length === 0) return [];
        const catCol = categoricalColumns[0];
        const counts = {};
        data.forEach(row => {
            const val = row[catCol];
            counts[val] = (counts[val] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name: String(name), value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [data, categoricalColumns]);

    if (!data || data.length === 0) {
        return <div className="text-center p-10">No data available</div>;
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem' }}>Dashboard</h2>
                <button onClick={onReset} className="glass-button" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <RefreshCw size={16} /> Upload New File
                </button>
            </div>

            {/* Stats Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <StatsCard
                    title="Total Records"
                    value={stats.totalRows}
                    icon={Activity}
                    trend={12} // Mock trend
                />
                {numericalColumns.length > 0 && (
                    <>
                        <StatsCard
                            title={`Total ${stats.firstNumCol}`}
                            value={stats.totalValue.toLocaleString()}
                            icon={BarChart2}
                            trend={-5} // Mock trend
                        />
                        <StatsCard
                            title={`Avg ${stats.firstNumCol}`}
                            value={stats.avgValue}
                            icon={PieIcon}
                        />
                    </>
                )}
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '30px' }}>

                {/* Line Chart */}
                {numericalColumns.length > 0 && (
                    <ChartCard title={`${numericalColumns[0]} Trend`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#0a84ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis
                                    dataKey={categoricalColumns[0] || 'index'}
                                    stroke="#8e8e93"
                                    tick={{ fill: '#8e8e93' }}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#8e8e93"
                                    tick={{ fill: '#8e8e93' }}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={numericalColumns[0]}
                                    stroke="#0a84ff"
                                    fillOpacity={1}
                                    fill="url(#colorVal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}

                {/* Bar Chart */}
                {numericalColumns.length > 1 && (
                    <ChartCard title={`${numericalColumns[0]} vs ${numericalColumns[1]}`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey={categoricalColumns[0] || 'index'} stroke="#8e8e93" tick={{ fill: '#8e8e93' }} tickLine={false} />
                                <YAxis stroke="#8e8e93" tick={{ fill: '#8e8e93' }} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Legend />
                                <Bar dataKey={numericalColumns[0]} fill="#30d158" radius={[4, 4, 0, 0]} />
                                <Bar dataKey={numericalColumns[1]} fill="#bf5af2" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}

                {/* Pie Chart */}
                {pieData.length > 0 && (
                    <ChartCard title={`Distribution by ${categoricalColumns[0]}`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(28, 28, 30, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
