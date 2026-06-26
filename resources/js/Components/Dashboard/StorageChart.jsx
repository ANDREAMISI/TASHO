import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#6C5CE7', '#48BB78', '#F6AD55', '#FC8181'];

export default function StorageChart({ data }) {
    const chartData = [
        { name: 'Images', value: data.images || 0 },
        { name: 'Vidéos', value: data.videos || 0 },
        { name: 'Documents', value: data.documents || 0 },
        { name: 'Autres', value: data.total - (data.images || 0) - (data.videos || 0) - (data.documents || 0) },
    ].filter(item => item.value > 0);

    if (chartData.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Aucun fichier à afficher</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}