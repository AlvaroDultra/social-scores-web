interface Stat {
  label: string;
  value: string | number;
}

interface Props {
  stats: Stat[];
}

export default function StatsGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm"
        >
          <div className="text-2xl font-bold text-blue-700">{stat.value}</div>
          <div className="text-xs text-gray-500 mt-1 leading-tight">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
