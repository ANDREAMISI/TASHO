import { FolderIcon, DocumentIcon, UsersIcon, ChartBarIcon, CloudIcon } from '@/Components/Icons';

const iconMap = {
    '📁': FolderIcon,
    '📄': DocumentIcon,
    '👤': UsersIcon,
    '👥': UsersIcon,
    '📊': ChartBarIcon,
    '💾': CloudIcon,
};

export default function StatsCard({ title, value, icon, subtitle, trend }) {
    const IconComponent = iconMap[icon] || FolderIcon;

    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className="flex-shrink-0 bg-tasho-primary/10 rounded-lg p-3">
                        <IconComponent className="h-6 w-6 text-tasho-primary" />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center">
                        <span className={`text-xs font-medium flex items-center ${
                            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {trend.direction === 'up' ? (
                                <ArrowUpIcon className="h-3 w-3 mr-1" />
                            ) : (
                                <ArrowDownIcon className="h-3 w-3 mr-1" />
                            )}
                            {trend.value} {trend.label}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}