import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import {
  ShieldAlert, AlertTriangle, Info, CheckCircle2,
  Calendar, Building, ArrowRight, Zap, ShieldCheck
} from 'lucide-react';

export default function AlertsPage() {
  const { user } = useAuth();
  const { riskAlerts, resolveRiskAlert, isLoopCompleted } = useCapacity();
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  if (!user) return null;

  const filtered = riskAlerts.filter(a => {
    return severityFilter === 'all' || a.severity === severityFilter;
  });

  const criticalCount = riskAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = riskAlerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff9933] bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
              National Security & Capability Threat Monitor
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0b2545] tracking-tight">
            Institutional Capability Risk Alerts
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Proactive early warnings on skill deficits, expiring certifications, and compliance vulnerability
          </p>
        </div>

        <div className="flex items-center gap-3">
          {criticalCount > 0 ? (
            <span className="px-3.5 py-1.5 bg-red-50 text-red-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-red-300">
              <ShieldAlert size={15} className="text-red-600 animate-pulse" /> {criticalCount} Critical Threats
            </span>
          ) : (
            <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-300">
              <ShieldCheck size={15} /> All Critical Threats Mitigated
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-3.5 py-1.5 bg-amber-50 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-amber-300">
              <AlertTriangle size={15} /> {warningCount} Warnings
            </span>
          )}
        </div>
      </div>

      {/* Closed Loop Status */}
      {isLoopCompleted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              Automatic Mitigation Applied
            </p>
            <p className="text-xs text-emerald-900 mt-0.5">
              The severe Data Analytics gap in Finance/Engineering has been automatically resolved following Arjun Sharma's proctored exam success.
            </p>
          </div>
        </div>
      )}

      {/* Severity Filter Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {(['all', 'critical', 'warning', 'info'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              severityFilter === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {s} ({s === 'all' ? riskAlerts.length : riskAlerts.filter(a => a.severity === s).length})
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filtered.map(alert => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';
          const isResolved = alert.title.startsWith('✓ RESOLVED');

          const iconColor = isResolved
            ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
            : isCritical
            ? 'text-red-700 bg-red-50 border-red-200'
            : isWarning
            ? 'text-amber-800 bg-amber-50 border-amber-200'
            : 'text-blue-700 bg-blue-50 border-blue-200';

          return (
            <div
              key={alert.id}
              className={`p-6 rounded-3xl border transition-all ${
                isResolved
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                  : isCritical
                  ? 'bg-white border-red-200 shadow-sm hover:shadow-md'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${iconColor}`}>
                    {isResolved ? (
                      <CheckCircle2 size={22} className="text-emerald-700" />
                    ) : isCritical ? (
                      <ShieldAlert size={22} />
                    ) : isWarning ? (
                      <AlertTriangle size={22} />
                    ) : (
                      <Info size={22} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCritical
                            ? 'bg-red-100 text-red-800'
                            : isWarning
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isResolved ? 'Resolved' : alert.severity}
                      </span>
                      {alert.affectedDepartment && (
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Building size={12} /> {alert.affectedDepartment}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar size={12} /> {alert.createdAt}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-slate-900 mt-1">{alert.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">{alert.description}</p>

                    <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
                      <Zap size={15} className="text-[#c69214] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Prescribed Mitigation Protocol
                        </p>
                        <p className="text-xs text-slate-700 mt-0.5 font-medium">{alert.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 flex-shrink-0 self-end sm:self-start">
                  {!isResolved && (
                    <button
                      onClick={() => resolveRiskAlert(alert.id)}
                      className="px-4 py-2 bg-[#0b2545] text-white rounded-xl text-xs font-bold hover:bg-[#13315c] transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <span>Take Action</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
