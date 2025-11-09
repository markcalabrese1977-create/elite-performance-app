// src/app/progress/ProgressCharts.tsx
'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

type ProgressData = {
  oneRMData: any[];
  volumeData: any[];
  frequencyData: any[];
};

export default function ProgressCharts({ oneRMData, volumeData, frequencyData }: ProgressData) {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-4xl font-bold text-center">Your Progress</h1>

      {/* 1RM Progression */}
      <div className="bg-card p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">1RM Progression (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={oneRMData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(v) => format(new Date(v), 'MMM d')} />
            <YAxis />
            <Tooltip formatter={(v) => Math.round(Number(v))} />
            <Legend />
            <Line type="monotone" dataKey="oneRM" stroke="#8884d8" name="Estimated 1RM" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Volume */}
      <div className="bg-card p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Weekly Volume (lbs)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" tickFormatter={(v) => format(new Date(v), 'MMM d')} />
            <YAxis />
            <Tooltip formatter={(v) => Number(v).toLocaleString()} />
            <Bar dataKey="volume" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Exercise Frequency */}
      <div className="bg-card p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Exercise Frequency</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={frequencyData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
            <Radar name="Sets" dataKey="count" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}