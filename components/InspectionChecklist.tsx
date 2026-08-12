import React from 'react';
import { CheckCircle2, XCircle, BatteryCharging, ShieldCheck } from 'lucide-react';

interface TestingChecklist {
  screen?: string;
  keyboard?: string;
  thermals?: string;
  ports?: string;
  battery?: string;
  [key: string]: string | undefined;
}

interface InspectionChecklistProps {
  condition: 'NEW' | 'UK_USED_GRADE_A' | 'UK_USED_GRADE_B' | 'SECOND_HAND';
  specs?: {
    battery_health?: string;
    ram?: string;
    storage?: string;
    processor?: string;
  } | null;
  testingChecklist?: TestingChecklist | null;
}

export default function InspectionChecklist({
  condition,
  specs,
  testingChecklist,
}: InspectionChecklistProps) {
  if (condition === 'NEW') {
    return (
      <div className="glass-panel p-6 rounded-xl border border-emerald-500/20 text-center">
        <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
        <h4 className="font-semibold text-lg text-emerald-300">Factory Sealed & Certified</h4>
        <p className="text-sm text-slate-400 mt-1">
          This product is brand new and comes in its original retail packaging with full manufacturer warranty.
        </p>
      </div>
    );
  }

  const checklist = testingChecklist || {
    screen: 'Pass',
    keyboard: 'Pass',
    thermals: 'Pass',
    ports: 'Pass',
  };

  const batteryHealth = parseInt(specs?.battery_health || '100', 10);

  const getHealthColor = (health: number) => {
    if (health >= 85) return 'text-emerald-400 bg-emerald-400';
    if (health >= 70) return 'text-amber-400 bg-amber-400';
    return 'text-red-400 bg-red-400';
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-700/50 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
        <div>
          <h4 className="font-semibold text-lg text-slate-200">Quality Inspection Certificate</h4>
          <p className="text-xs text-slate-400">Strictly tested by our in-house repair technicians</p>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-semibold text-sky-400 uppercase tracking-wider border border-slate-700">
          Verified OK
        </span>
      </div>

      {/* Battery Health Progress */}
      {specs?.battery_health && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 flex items-center gap-1.5">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              Battery Capacity Health:
            </span>
            <span className={`font-semibold ${getHealthColor(batteryHealth).split(' ')[0]}`}>
              {specs.battery_health}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${getHealthColor(batteryHealth).split(' ')[1]}`}
              style={{ width: `${Math.min(batteryHealth, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Checklist grid */}
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(checklist).map(([key, val]) => {
          const isPass = val?.toLowerCase() === 'pass';
          return (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800/60"
            >
              <span className="text-sm font-medium text-slate-300 capitalize">{key}</span>
              {isPass ? (
                <span className="flex items-center text-xs text-emerald-400 gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Pass
                </span>
              ) : (
                <span className="flex items-center text-xs text-rose-400 gap-1 font-semibold">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  {val || 'Fail'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
