// src/components/WeeklyPieChart.jsx
export default function WeeklyPieChart({ weekData }) {
  const studiedCount = weekData.filter((d) => d.studied).length;
  const missedCount = weekData.length - studiedCount;

  const data = [
    { name: "Studied", value: studiedCount },
    { name: "Missed", value: missedCount },
  ];

  return (
    <div style={{ width: "100%", height: 260 }}>
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
