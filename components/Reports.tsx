import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  ShieldAlert, 
  Calendar, 
  FileDown,
  Activity,
  Printer,
  Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AnalysisResult, BuildingParams } from '../types';

interface ReportsProps {
  buildingParams: BuildingParams;
  analysis: AnalysisResult | null;
  getSnapshot?: () => string;
}

const Reports: React.FC<ReportsProps> = ({ buildingParams, analysis, getSnapshot }) => {
  const [generating, setGenerating] = useState<string | null>(null);

  const generateStructuralReport = () => {
    if (!analysis) return;
    setGenerating('structural');
    
    // Small delay to allow UI to update before blocking with PDF generation
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = margin;

        // Header
        doc.setFillColor(15, 23, 42); // Slate 900
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text("Structural Audit Report", margin, 25);
        
        y = 50;

        // Building Info
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, margin, y);
        y += 10;
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.setFont(undefined, 'bold');
        doc.text("Site Specifications", margin, y);
        y += 8;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        
        const specs = [
          `Construction Year: ${buildingParams.year}`,
          `Material: ${buildingParams.material}`,
          `Floors: ${buildingParams.floors} (G + ${buildingParams.floors - 1})`,
          `Seismic Zone: ${buildingParams.seismicZone} (IS 1893:2016)`,
          `Occupancy: ${buildingParams.occupancy}`
        ];
        
        specs.forEach(spec => {
          doc.text(`• ${spec}`, margin + 5, y);
          y += 6;
        });
        y += 10;

        // Analysis
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text("Vulnerability Assessment (IS 15988)", margin, y);
        y += 8;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(11);
        doc.text(`Risk Index: ${analysis.vulnerabilityScore}/100`, margin + 5, y);
        y += 8;
        
        const summary = doc.splitTextToSize(analysis.summary, pageWidth - 2 * margin - 5);
        doc.text(summary, margin + 5, y);
        y += summary.length * 6 + 10;

        // Snapshot
        if (getSnapshot) {
          try {
            const img = getSnapshot();
            const imgH = 80;
            if (y + imgH > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              y = margin;
            }
            doc.addImage(img, 'PNG', margin, y, 120, imgH);
            y += imgH + 10;
          } catch (e) {
            console.error("Snapshot failed", e);
          }
        }

        doc.save('Structural_Audit_Report.pdf');
      } catch (e) {
        console.error(e);
        alert('Failed to generate report. Please ensure all data is loaded.');
      } finally {
        setGenerating(null);
      }
    }, 100);
  };

  const generateEmergencyPlan = () => {
    if (!analysis) return;
    setGenerating('emergency');
    
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = margin;

        // Red Header for Emergency
        doc.setFillColor(185, 28, 28); // Red 700
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text("Disaster Management Plan", margin, 25);
        
        y = 50;
        
        // Critical Zones Warning
        doc.setFontSize(14);
        doc.setTextColor(185, 28, 28);
        doc.setFont(undefined, 'bold');
        doc.text("HIGH RISK ZONES", margin, y);
        y += 8;
        
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text("The following structural elements are critical during seismic activity:", margin, y);
        y += 8;
        
        analysis.criticalZones.forEach(zone => {
          doc.setFillColor(254, 226, 226); // Light Red
          doc.rect(margin, y - 4, pageWidth - 2 * margin, 8, 'F');
          doc.text(`⚠️ ${zone}`, margin + 5, y + 1);
          y += 10;
        });
        y += 10;

        // Evacuation Routes
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0);
        doc.text("Evacuation Protocols", margin, y);
        y += 8;
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const protocols = [
          "1. Immediate Action: 'Drop, Cover, and Hold On'.",
          "2. Route: Use external staircases. Do NOT use lifts.",
          "3. Assembly Point: Open ground at least 50m from building facade.",
          "4. Medical: First Aid kits available at Security Cabin (Gate 1)."
        ];
        
        protocols.forEach(p => {
          const text = doc.splitTextToSize(p, pageWidth - 2 * margin);
          doc.text(text, margin + 5, y);
          y += text.length * 6 + 4;
        });

        // Snapshot with Safe Zones
        if (getSnapshot) {
          if (y + 90 > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              y = margin;
          }
          y += 5;
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text("Safe Assembly Areas", margin, y);
          y += 8;
          try {
            const img = getSnapshot();
            doc.addImage(img, 'PNG', margin, y, 120, 80);
          } catch (e) {}
        }

        doc.save('Emergency_Plan.pdf');
      } catch (e) {
        console.error(e);
      } finally {
        setGenerating(null);
      }
    }, 100);
  };

  const generateMaintenanceSchedule = () => {
    setGenerating('maintenance');
    
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = margin;

        // Green Header for Maintenance
        doc.setFillColor(21, 128, 61); // Green 700
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text("Maintenance Schedule", margin, 25);
        
        y = 50;

        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.text(`Building Age: ${new Date().getFullYear() - buildingParams.year} years`, margin, y);
        y += 15;

        // Schedule Table Header
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, pageWidth - 2*margin, 10, 'F');
        doc.setFont(undefined, 'bold');
        doc.text("Action Item", margin + 5, y + 7);
        doc.text("Frequency", margin + 100, y + 7);
        doc.text("Next Due", margin + 140, y + 7);
        y += 15;

        const tasks = [
          { task: "Pre-Monsoon Roof Inspection", freq: "Annual (May)", due: "May 15, 2024" },
          { task: "External Plaster Check", freq: "Annual", due: "Oct 10, 2024" },
          { task: "Column Crack Mapping", freq: "Quarterly", due: "Jan 01, 2024" },
          { task: "Water Tank Leakage Check", freq: "Monthly", due: "Nov 05, 2023" },
          { task: "NDT Rebound Hammer Test", freq: "5 Years", due: "Aug 20, 2026" },
        ];

        doc.setFont(undefined, 'normal');
        tasks.forEach((t, i) => {
          if (i % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, y - 5, pageWidth - 2*margin, 10, 'F');
          }
          doc.text(t.task, margin + 5, y);
          doc.text(t.freq, margin + 100, y);
          doc.text(t.due, margin + 140, y);
          y += 10;
        });

        doc.save('Maintenance_Schedule.pdf');
      } catch (e) {
        console.error(e);
      } finally {
        setGenerating(null);
      }
    }, 100);
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Reports & Docs</h1>
          <p className="text-slate-400 text-sm">Generate engineering audit reports and safety protocols.</p>
        </div>
      </div>

      {!analysis && (
        <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg flex items-center gap-3">
          <Info className="text-amber-400 w-5 h-5 flex-shrink-0" />
          <p className="text-amber-200 text-sm">
            Please run a <strong>Structural Diagnostic</strong> analysis from the Dashboard first to populate data for reports.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Structural Report Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 flex flex-col">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Structural Audit</h3>
          <p className="text-slate-400 text-sm mb-6 flex-grow">
            Comprehensive audit Report based on IS 15988 & IS 1893, detailing vulnerability zones and retrofit costs.
          </p>
          <button 
            onClick={generateStructuralReport}
            disabled={!analysis || generating === 'structural'}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating === 'structural' ? <Activity className="animate-spin w-4 h-4" /> : <FileDown className="w-4 h-4" />}
            Download PDF
          </button>
        </div>

        {/* Emergency Plan Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 flex flex-col">
          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Disaster Plan</h3>
          <p className="text-slate-400 text-sm mb-6 flex-grow">
            Evacuation protocols, fire extinguisher mapping, and high-risk zone identification.
          </p>
          <button 
            onClick={generateEmergencyPlan}
            disabled={!analysis || generating === 'emergency'}
            className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating === 'emergency' ? <Activity className="animate-spin w-4 h-4" /> : <FileDown className="w-4 h-4" />}
            Download PDF
          </button>
        </div>

        {/* Maintenance Schedule Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 flex flex-col">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Maintenance Log</h3>
          <p className="text-slate-400 text-sm mb-6 flex-grow">
            Schedule for pre-monsoon checks, tank cleaning, and crack monitoring.
          </p>
          <button 
             onClick={generateMaintenanceSchedule}
             disabled={generating === 'maintenance'}
             className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating === 'maintenance' ? <Activity className="animate-spin w-4 h-4" /> : <FileDown className="w-4 h-4" />}
            Download PDF
          </button>
        </div>

      </div>

      {/* Recent History Section (Mock) */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 mt-2">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Documents</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-3">Document Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="p-3 text-slate-200 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Audit_Bldg_404_Mumbai.pdf
                </td>
                <td className="p-3 text-slate-400">Structural Audit</td>
                <td className="p-3 text-slate-400">Oct 24, 2023</td>
                <td className="p-3"><span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Verified</span></td>
                <td className="p-3 text-right">
                  <button className="text-slate-400 hover:text-white"><Download className="w-4 h-4" /></button>
                </td>
              </tr>
              <tr className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="p-3 text-slate-200 font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" /> NOC_Fire_Safety.pdf
                </td>
                <td className="p-3 text-slate-400">Compliance</td>
                <td className="p-3 text-slate-400">Oct 20, 2023</td>
                <td className="p-3"><span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Issued</span></td>
                <td className="p-3 text-right">
                  <button className="text-slate-400 hover:text-white"><Download className="w-4 h-4" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;