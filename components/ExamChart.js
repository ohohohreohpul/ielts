'use client'

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#F97316', '#1E293B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4']

export default function ExamChart({ chartData }) {
  if (!chartData) return null

  const { chartType, title, xAxisLabel, yAxisLabel, categories, datasets } = chartData

  // Transform data for recharts
  const transformedData = categories?.map((cat, i) => {
    const point = { name: cat }
    datasets?.forEach((ds) => {
      point[ds.label] = ds.data?.[i] ?? 0
    })
    return point
  }) || []

  if (chartType === 'pie') {
    const pieData = categories?.map((cat, i) => ({
      name: cat,
      value: datasets?.[0]?.data?.[i] ?? 0
    })) || []

    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        {title && <h3 className="text-sm font-bold text-gray-800 text-center mb-3">{title}</h3>}
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={40}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={true}
              fontSize={11}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (chartType === 'line') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        {title && <h3 className="text-sm font-bold text-gray-800 text-center mb-3">{title}</h3>}
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={transformedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, fontSize: 11 } : undefined} />
            <YAxis tick={{ fontSize: 11 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 11 } : undefined} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {datasets?.map((ds, i) => (
              <Line
                key={ds.label}
                type="monotone"
                dataKey={ds.label}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Default: bar chart
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      {title && <h3 className="text-sm font-bold text-gray-800 text-center mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={transformedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5, fontSize: 11 } : undefined} />
          <YAxis tick={{ fontSize: 11 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 11 } : undefined} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          {datasets?.map((ds, i) => (
            <Bar
              key={ds.label}
              dataKey={ds.label}
              fill={COLORS[i % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
