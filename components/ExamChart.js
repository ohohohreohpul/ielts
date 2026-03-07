'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const COLORS = ['#F97316', '#1E293B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4']

export default function ExamChart({ chartData }) {
  const [chartWidth, setChartWidth] = useState(340)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateWidth = () => {
      const w = Math.min(window.innerWidth - 48, 600)
      setChartWidth(w)
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  if (!chartData || !mounted) return null

  const { chartType, title, xAxisLabel, yAxisLabel, categories, datasets } = chartData

  if (!categories || !datasets || categories.length === 0) return null

  const chartHeight = 260

  // Transform data for recharts
  const transformedData = categories.map((cat, i) => {
    const point = { name: cat }
    datasets.forEach((ds) => {
      point[ds.label] = ds.data?.[i] ?? 0
    })
    return point
  })

  if (chartType === 'pie') {
    const pieData = categories.map((cat, i) => ({
      name: cat,
      value: datasets?.[0]?.data?.[i] ?? 0
    }))

    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        {title && <h3 className="text-sm font-bold text-gray-800 text-center mb-3">{title}</h3>}
        <div className="flex justify-center">
          <PieChart width={chartWidth} height={chartHeight}>
            <Pie
              data={pieData}
              cx={chartWidth / 2}
              cy={chartHeight / 2 - 15}
              outerRadius={Math.min(chartWidth, chartHeight) / 3}
              innerRadius={Math.min(chartWidth, chartHeight) / 6}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={true}
              fontSize={10}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </div>
      </div>
    )
  }

  if (chartType === 'line') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        {title && <h3 className="text-sm font-bold text-gray-800 text-center mb-3">{title}</h3>}
        <div className="overflow-x-auto">
          <LineChart width={chartWidth} height={chartHeight} data={transformedData} margin={{ top: 5, right: 15, left: 5, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {datasets.map((ds, i) => (
              <Line
                key={ds.label}
                type="monotone"
                dataKey={ds.label}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </div>
        {(xAxisLabel || yAxisLabel) && (
          <p className="text-xs text-gray-400 text-center mt-1">
            {xAxisLabel && `X: ${xAxisLabel}`}{xAxisLabel && yAxisLabel && ' | '}{yAxisLabel && `Y: ${yAxisLabel}`}
          </p>
        )}
      </div>
    )
  }

  // Default: bar chart
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      {title && <h3 className="text-sm font-bold text-gray-800 text-center mb-3">{title}</h3>}
      <div className="overflow-x-auto">
        <BarChart width={chartWidth} height={chartHeight} data={transformedData} margin={{ top: 5, right: 15, left: 5, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          {datasets.map((ds, i) => (
            <Bar
              key={ds.label}
              dataKey={ds.label}
              fill={COLORS[i % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </div>
      {(xAxisLabel || yAxisLabel) && (
        <p className="text-xs text-gray-400 text-center mt-1">
          {xAxisLabel && `X: ${xAxisLabel}`}{xAxisLabel && yAxisLabel && ' | '}{yAxisLabel && `Y: ${yAxisLabel}`}
        </p>
      )}
    </div>
  )
}
