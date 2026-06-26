import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function ActivityChart({ data, labels }) {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    const chartData = labels.map(label => ({
        date: label,
        activités: data[label] || 0,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval={Math.floor(chartData.length / 15)}
                />
                <YAxis />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="activités"
                    stroke="#6C5CE7"
                    strokeWidth={2}
                    dot={{ fill: '#6C5CE7' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}