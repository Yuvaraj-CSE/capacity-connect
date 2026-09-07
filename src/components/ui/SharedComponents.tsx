import React from 'react';
import { ShieldCheck, QrCode, Download, Printer, CheckCircle2, AlertTriangle, CircleAlert } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── State Emblem of India (Ashoka Lion Capital with Satyameva Jayate) ────────
export function StateEmblem({ className = 'w-8 h-10', color = '#c69214' }: { className?: string; color?: string }) {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg viewBox="0 0 100 120" className="w-full h-full" fill={color} aria-label="State Emblem of India">
        {/* Ashoka Lion crest silhouette */}
        <circle cx="50" cy="18" r="10" opacity="0.9" />
        <circle cx="34" cy="22" r="8" opacity="0.8" />
        <circle cx="66" cy="22" r="8" opacity="0.8" />
        <path d="M26 34 C32 20, 68 20, 74 34 C80 50, 70 64, 50 67 C30 64, 20 50, 26 34 Z" opacity="0.95" />
        {/* Abacus frieze */}
        <rect x="22" y="70" width="56" height="12" rx="2" />
        {/* Central 24-spoke Ashoka Chakra motif */}
        <circle cx="50" cy="76" r="4.5" fill="#ffffff" />
        <circle cx="50" cy="76" r="2.5" fill={color} />
        {/* Base lotus pedestal */}
        <path d="M16 85 L84 85 L76 96 L24 96 Z" opacity="0.9" />
        <rect x="20" y="99" width="60" height="3" rx="1.5" opacity="0.75" />
      </svg>
      <span className="text-[7.5px] font-bold tracking-widest text-[#a8790b] mt-0.5 whitespace-nowrap font-serif">
        सत्यमेव जयते
      </span>
    </div>
  );
}

// ─── Government-Grade Stat Card ───────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'teal' | 'gold' | 'saffron' | 'green' | 'red';
  trend?: number;
  badge?: string;
}

export function StatCard({ label, value, sub, icon, color = 'blue', trend, badge }: StatCardProps) {
  const colorMap: Record<string, { bg: string; text: string; bar: string }> = {
    blue:    { bg: 'bg-[#0b2545]/5 text-[#0b2545]',   text: 'text-[#0b2545]', bar: 'bg-[#0b2545]' },
    teal:    { bg: 'bg-teal-50 text-teal-700',       text: 'text-teal-700',   bar: 'bg-teal-600' },
    gold:    { bg: 'bg-amber-50 text-[#c69214]',     text: 'text-[#c69214]', bar: 'bg-[#c69214]' },
    saffron: { bg: 'bg-orange-50 text-[#e06d00]',    text: 'text-[#e06d00]', bar: 'bg-[#ff9933]' },
    green:   { bg: 'bg-green-50 text-emerald-700',   text: 'text-emerald-700', bar: 'bg-emerald-600' },
    red:     { bg: 'bg-red-50 text-red-700',         text: 'text-red-700',   bar: 'bg-red-600' },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all relative overflow-hidden group">
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.bar}`} />

      <div className="flex items-start justify-between">
        <div className="pr-2">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          <p className="text-3xl font-black tracking-tight text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1.5 font-medium">{sub}</p>}
          {trend !== undefined && (
            <p className={`text-xs font-semibold mt-2.5 flex items-center gap-1 ${trend >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              <span className="text-sm">{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% national improvement</span>
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-2xl ${scheme.bg} flex-shrink-0 group-hover:scale-105 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Progress Bar with Benchmark Line ─────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  required?: number;
  color?: 'blue' | 'teal' | 'green' | 'orange' | 'red' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({ value, required, color = 'blue', size = 'md', showLabel = false }: ProgressBarProps) {
  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' };
  const colorMap: Record<string, string> = {
    blue:   'bg-[#0b2545]',
    teal:   'bg-teal-600',
    green:  'bg-emerald-600',
    orange: 'bg-[#ff9933]',
    red:    'bg-red-600',
    gold:   'bg-[#c69214]',
  };
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-600 font-semibold mb-1">
          <span>Current Level: {clampedValue}%</span>
          {required && <span>Target: {required}%</span>}
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-slate-100 rounded-full relative overflow-hidden border border-slate-200/60`}>
        <div
          className={`progress-bar ${heights[size]} ${colorMap[color]} rounded-full transition-all duration-800`}
          style={{ width: `${clampedValue}%` }}
        />
        {required !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-slate-900/60 z-10"
            style={{ left: `${required}%` }}
            title={`Required Benchmark: ${required}%`}
          />
        )}
      </div>
    </div>
  );
}

// ─── Circular Score Dial with Ashoka Motif ────────────────────────────────────
interface CircularScoreProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function CircularScore({ value, size = 130, strokeWidth = 10, color = '#ff9933', label }: CircularScoreProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900 tracking-tight">{value}%</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Readiness</span>
        </div>
      </div>
      {label && <p className="text-xs text-slate-600 mt-2.5 font-bold uppercase tracking-wider">{label}</p>}
    </div>
  );
}

// ─── FRAC Competency Score Pill ───────────────────────────────────────────────
export function ScorePill({ value }: { value: number }) {
  if (value >= 75) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
        <CheckCircle2 size={13} aria-hidden="true" />
        <span>{value}% · Proficient</span>
      </span>
    );
  }
  if (value >= 55) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
        <AlertTriangle size={13} aria-hidden="true" />
        <span>{value}% · Developing</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-800 bg-red-50 border border-red-300 px-3 py-1 rounded-full">
      <CircleAlert size={13} aria-hidden="true" />
      <span>{value}% · Critical Gap</span>
    </span>
  );
}

// ─── Avatar Component ─────────────────────────────────────────────────────────
export function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-13 h-13 text-base',
    xl: 'w-16 h-16 text-lg',
  };
  return (
    <div className={`${sizes[size]} rounded-2xl bg-gradient-to-br from-[#0b2545] to-[#13315c] text-amber-300 font-bold flex items-center justify-center border-2 border-amber-400/40 shadow-xs flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ─── Official Badge ───────────────────────────────────────────────────────────
export function Badge({ label, color = 'blue' }: { label: string; color?: 'blue' | 'teal' | 'gold' | 'saffron' | 'green' | 'red' | 'slate' }) {
  const colorMap: Record<string, string> = {
    blue:    'bg-[#0b2545]/10 text-[#0b2545] border-[#0b2545]/20',
    teal:    'bg-teal-50 text-teal-800 border-teal-200',
    gold:    'bg-amber-50 text-[#996515] border-amber-300',
    saffron: 'bg-orange-50 text-[#c65d07] border-orange-300',
    green:   'bg-emerald-50 text-emerald-800 border-emerald-200',
    red:     'bg-red-50 text-red-800 border-red-200',
    slate:   'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${colorMap[color] || colorMap.blue}`}>
      {label}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  subtitle,
  titleHi,
  action,
}: {
  title: string;
  subtitle?: string;
  titleHi?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
      <div>
        {titleHi && <p className="text-[11px] font-bold text-[#c69214] uppercase tracking-wider">{titleHi}</p>}
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── Official Verifiable Certificate of Competency ────────────────────────────
export function OfficialCertificate({
  title,
  recipientName,
  recipientPosition,
  score,
  issuedDate,
  uid,
  onClose,
}: {
  title: string;
  recipientName: string;
  recipientPosition: string;
  score: number;
  issuedDate: string;
  uid: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-4 border-[#c69214]/60 overflow-hidden flex flex-col max-h-[95vh] animate-scale-in relative">
        {/* Tricolor Ribbon Top */}
        <div className="tricolor-ribbon" />

        {/* Certificate Frame Inner */}
        <div className="p-8 md:p-12 relative bg-[#fffdfa] border-8 border-double border-slate-200 overflow-y-auto">
          {/* Ashoka Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <StateEmblem className="w-96 h-96" />
          </div>

          {/* Top Crest */}
          <div className="flex flex-col items-center text-center mb-6">
            <StateEmblem className="w-12 h-14" />
            <p className="text-xs font-bold tracking-widest text-slate-700 uppercase mt-2">
              भारत सरकार | Government of India
            </p>
            <p className="text-[11px] font-semibold text-[#c69214] tracking-wider uppercase">
              Capacity Building Commission (CBC) • Mission Karmayogi
            </p>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#0b2545] mt-3">
              Certificate of Verified Competency
            </h3>
            <p className="text-xs text-slate-500 italic mt-1 font-serif">
              National Civil Service & Enterprise Capability Accreditation
            </p>
          </div>

          {/* Body */}
          <div className="text-center my-6 space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              This is to officially certify that
            </p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 border-b-2 border-slate-300 pb-2 inline-block px-8 font-serif">
              {recipientName}
            </p>
            <p className="text-xs text-slate-600 font-medium">
              {recipientPosition} · Department of Engineering
            </p>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
              has demonstrated certified proficiency in <strong className="text-slate-900 font-bold">{title}</strong> by successfully clearing the proctored competency assessment with a verified benchmark score of:
            </p>
            <div className="inline-flex items-center gap-2 bg-[#0b2545] text-amber-300 px-6 py-2 rounded-2xl font-black text-xl shadow-sm my-2">
              <span>{score}% Proficiency</span>
              <span className="text-xs text-emerald-400 font-semibold">• FRAC Benchmark Met</span>
            </div>
          </div>

          {/* Signatures & Security Footer */}
          <div className="grid grid-cols-3 items-end pt-8 border-t border-slate-300 mt-6 text-xs text-slate-600">
            {/* Left: UID & Date */}
            <div>
              <p className="font-mono text-[10px] text-slate-400">CERTIFICATE UID:</p>
              <p className="font-mono font-bold text-slate-800">{uid}</p>
              <p className="text-[11px] text-slate-500 mt-1">Date: {issuedDate}</p>
            </div>

            {/* Center: QR & Verification Stamp */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center p-1 shadow-xs">
                <QrCode size={48} className="text-[#0b2545]" />
              </div>
              <p className="text-[9px] font-mono text-slate-400 mt-1">Scan to Verify Authenticity</p>
            </div>

            {/* Right: Digital Signature */}
            <div className="text-right">
              <div className="inline-block border-b border-slate-800 pb-1">
                <span className="font-serif italic font-bold text-slate-800 text-sm">Adil Zainulbhai</span>
              </div>
              <p className="font-bold text-slate-900 mt-0.5">Chairperson</p>
              <p className="text-[10px] text-slate-500">Capacity Building Commission</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-700" />
            Digitally cryptographically signed on Government of India Ledger
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Certificate sent to printer / PDF download.')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={() => toast.success('Digital certificate downloaded.')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0b2545] text-white rounded-xl text-xs font-bold hover:bg-[#13315c]"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-300 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
