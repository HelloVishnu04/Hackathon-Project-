import React from 'react';
import {
  Activity,
  ChevronRight,
  DollarSign,
  FileDown,
  PlayCircle,
  Settings2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { AnalysisResult, BuildingParams, RetrofitOption, ViewMode } from '../../types';

type Props = {
  buildingParams: BuildingParams;
  analysis: AnalysisResult | null;
  loading: boolean;
  handleRunAnalysis: () => void;
  handleGenerateReport: () => void;
  setView: (view: ViewMode) => void;
  activeRetrofits: string[];
  toggleRetrofit: (option: RetrofitOption) => void;
  onRecalculate: () => void;
};

const RetrofitAdvisorPanel: React.FC<Props> = ({
  buildingParams,
  analysis,
  loading,
  handleRunAnalysis,
  handleGenerateReport,
  setView,
  activeRetrofits,
  toggleRetrofit,
  onRecalculate,
}) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShieldCheck className="text-cyan-400" /> AI Retrofit Advisor
        </h2>
        {analysis && (
          <button
            onClick={handleGenerateReport}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <FileDown className="w-3 h-3" />
            Generate Report
          </button>
        )}
      </div>

      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-slate-300">
            <Settings2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Active Configuration</span>
          </div>
          <button
            onClick={() => setView('profile')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Edit in Profile <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-4 text-xs text-slate-400">
          <span>{buildingParams.typology}</span>
          <span>•</span>
          <span>{buildingParams.floors} Floors</span>
          <span>•</span>
          <span>{buildingParams.seismicZone}</span>
        </div>
      </div>

      {!analysis ? (
        <div className="flex flex-col gap-4 text-center py-8">
          <p className="text-slate-400 text-sm">
            Review the active configuration above and run diagnostics to generate safety insights.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-900/20"
          >
            {loading ? <Activity className="animate-spin w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
            {loading ? 'Processing Structural Model...' : 'Run Structural Diagnostics'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-slate-400 font-mono">ANALYSIS COMPLETE</p>
            <button onClick={onRecalculate} className="text-xs text-cyan-400 hover:underline">
              Recalculate
            </button>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm text-slate-300">{analysis.summary}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-mono text-slate-500 uppercase">Recommended Interventions</p>
            {analysis.recommendations && analysis.recommendations.length > 0 ? (
              analysis.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-700/30 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-white">{rec.name}</h4>
                      <p className="text-xs text-slate-400">{rec.description}</p>
                    </div>
                    <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded font-mono">
                      +{rec.riskReduction}% Safety
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-4 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {rec.costEstimate}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> ROI: {rec.roi}/10
                      </span>
                    </div>
                    <button
                      onClick={() => toggleRetrofit(rec)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        activeRetrofits.includes(rec.type)
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-slate-600 text-white hover:bg-slate-500'
                      }`}
                    >
                      {activeRetrofits.includes(rec.type) ? 'Applied' : 'Visualize'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No specific recommendations provided by AI.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetrofitAdvisorPanel;
