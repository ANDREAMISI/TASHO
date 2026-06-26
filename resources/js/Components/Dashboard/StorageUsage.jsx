export default function StorageUsage({ used, limit }) {
    const usedGB = (used / 1073741824).toFixed(1);
    const limitGB = (limit / 1073741824).toFixed(1);
    const percentage = Math.min((used / limit) * 100, 100);

    const getColor = () => {
        if (percentage < 50) return 'bg-green-500';
        if (percentage < 75) return 'bg-yellow-500';
        if (percentage < 90) return 'bg-orange-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stockage utilisé</span>
                <span className="font-medium text-gray-900">
                    {usedGB} GB / {limitGB} GB
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full ${getColor()} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
                <span>{percentage.toFixed(0)}% utilisé</span>
                {percentage > 90 && (
                    <span className="text-red-500 font-medium">Espace presque plein</span>
                )}
            </div>
        </div>
    );
}