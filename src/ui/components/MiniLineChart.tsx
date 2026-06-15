"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface MiniLineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

interface DetailedLineChartProps {
  data: number[];
  color?: string;
  height?: number;
  title?: string;
}

export function MiniLineChart({ data, color = "#7D7254", height = 24 }: MiniLineChartProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  
  return (
    <div style={{ width: "60px", height: `${height}px` }} className="relative">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        <line x1="0" y1="0" x2="0" y2="100%" stroke="#B2A88A" strokeWidth="1" />
        <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#B2A88A" strokeWidth="1" />
      </svg>
      <div className="relative z-0" style={{ width: "100%", height: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DetailedLineChart({ data, color = "#7D7254", height = 200, title }: DetailedLineChartProps) {
  const chartData = data.map((value, index) => ({ value, day: index + 1 }));
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  
  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-medium text-warm-sand">{title}</h3>}
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#B2A88A" 
              strokeOpacity={0.15}
              vertical={false}
            />
            <XAxis 
              dataKey="day" 
              tick={{ fill: "#B2A88A", fontSize: 11 }}
              axisLine={{ stroke: "#B2A88A", strokeOpacity: 0.3 }}
              tickLine={false}
              interval="preserveStartEnd"
              label={{ value: "Days", position: "insideBottomRight", offset: -4, fill: "#B2A88A", fontSize: 10 }}
            />
            <YAxis 
              domain={[Math.min(0, minValue), maxValue * 1.1]}
              tick={{ fill: "#B2A88A", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value.toString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #7D7254",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
              labelStyle={{ color: "#B2A88A", fontSize: 12 }}
              itemStyle={{ color: "#F3E7D3", fontSize: 14, fontWeight: 600 }}
              formatter={(value: number) => [value.toLocaleString(), "Value"]}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, strokeWidth: 0, r: 4 }}
              activeDot={{ fill: color, strokeWidth: 2, stroke: "#F3E7D3", r: 6 }}
              isAnimationActive={true}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}