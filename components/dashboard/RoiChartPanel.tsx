import React from 'react';
import { DollarSign } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AnalysisResult } from '../../types';

type Props = {
  analysis: AnalysisResult | null;
};

const RoiChartPanel: React.FC<Props> = ({ analysis }) => {
  if (!analysis || !analysis.recommendations) {
    return null;
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex-grow">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <DollarSign className="text-green-400" /> Cost vs. Risk Reduction
      </h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analysis.recommendations || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={10}
              tickFormatter={(val) => (val ? String(val).split(' ')[0] : '')}
            />
            <YAxis stroke="#94a3b8" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
              cursor={{ fill: '#334155', opacity: 0.4 }}
            />
            <Legend />
            <Bar dataKey="roi" name="ROI Score" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="riskReduction" name="Risk Reduction %" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RoiChartPanel;
