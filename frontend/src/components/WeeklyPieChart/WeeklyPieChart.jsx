import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4CAF50", "#F44336"];

export default function WeeklyPieChart({ weekData }) {
  const studiedCount = weekData.filter((d) => d.studied).length;
  const missedCount = weekData.length - studiedCount;

  const data = [
    { name: "Studied", value: studiedCount },
    { name: "Missed", value: missedCount },
  ];

  return (
    <div style={{ width: "300px", height: "300px" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
