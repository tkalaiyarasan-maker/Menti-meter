import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  name: string;
  votes: number;
}

interface ResultsChartProps {
  data: ChartData[];
}

const colors = ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#818cf8', '#ec4899'];

const ResultsChart: React.FC<ResultsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis type="number" hide />
        <YAxis 
            dataKey="name" 
            type="category" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#6b7280', fontSize: 14 }}
            width={120}
        />
        <Tooltip
            cursor={{fill: 'transparent'}}
            contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4b5563',
                borderRadius: '0.5rem',
                color: '#ffffff'
            }}
        />
        <Bar dataKey="votes" barSize={35} radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResultsChart;
