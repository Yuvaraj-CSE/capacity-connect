import { useNavigate } from 'react-router-dom';
import { StateEmblem } from '../components/ui/SharedComponents';
import GovTopBar from '../components/layout/GovTopBar';
import {
  Brain, BarChart3, Library, Target, ArrowRight,
  ShieldCheck, Award, Sparkles, Building2,
  FileCheck2, ChevronRight
} from 'lucide-react';

const FRAC_PILLARS = [
  {
    icon: <Brain size={26} className="text-[#c69214]" />,
    title: 'Competency Intelligence (FRAC)',
    titleHi: 'दक्षता आधारित संरचना',
    desc: 'Aligined with Mission Karmayogi Framework for Roles, Activities & Competencies. Moves beyond attendance to evaluate verifiable skill capabilities.',
  },
  {
    icon: <Target size={26} className="text-[#ff9933]" />,
    title: 'Closed-Loop Gap Mitigation',
    titleHi: 'दक्षता अंतराल समाधान',
    desc: 'Pinpoints individual and department-level skill gaps, prescribes targeted interventions, and updates official readiness scores upon proctored assessment.',
  },
  {
    icon: <BarChart3 size={26} className="text-emerald-600" />,
    title: 'Executive Readiness Analytics',
    titleHi: 'प्रशासनिक प्रभाव विश्लेषण',
    desc: 'Enterprise-grade dashboards tracking national readiness, division scorecards, and demonstrable training Return-on-Investment (ROI).',
  },
  {
    icon: <Library size={26} className="text-blue-600" />,
    title: 'Institutional Knowledge Hub',
    titleHi: 'केंद्रीय ज्ञान भंडार',
    desc: 'Single source of truth for official Standard Operating Procedures (SOPs), government circulars, compliance mandates, and civil service manuals.',
  },
  {
    icon: <Award size={26} className="text-[#c69214]" />,
    title: 'Cryptographic Credentials',
    titleHi: 'प्रमाणित डिजिटल प्रमाण-पत्र',
    desc: 'Mint tamper-evident Government of India digital competency certificates with verifiable QR verification hashes.',
  },
  {
    icon: <ShieldCheck size={26} className="text-emerald-600" />,
    title: 'Proactive Capability Risk Alerts',
    titleHi: 'दक्षता जोखिम पूर्वचेतावनी',
    desc: 'Automated early warning system flagging mission-critical skill shortages, expiring credentials, and departmental readiness breaches.',
  },
];

const NATIONAL_STATS = [
  { label: 'Civil Servants & Staff Tracked', labelHi: 'प्रशिक्षित लोकसेवक', value: '1,42,800+', change: '+18.4% YoY' },
  { label: 'National Competencies Indexed', labelHi: 'दक्षताएं पंजीकृत', value: '480+', change: 'FRAC Aligned' },
  { label: 'Capability Score Average', labelHi: 'राष्ट्रीय क्षमता सूचकांक', value: '74.2%', change: '+5.2% Lift' },
  { label: 'Gaps Closed Through Learning', labelHi: 'समाधानित अंतराल', value: '18,940', change: '94% Pass Rate' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#0b2545] flex flex-col selection:bg-amber-200">
      {/* 1. Official Government of India Top Strip */}
      <GovTopBar />

      {/* 2. Main Portal Header */}
      <header className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <StateEmblem className="w-10 h-13" />
            <div className="border-l border-slate-300 pl-4">
              <p className="text-xs font-bold text-[#c69214] uppercase tracking-widest leading-tight font-serif">
                भारत सरकार | Government of India
              </p>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#0b2545] leading-none mt-1">
                CAPACITY CONNECT
              </h1>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                राष्ट्रीय क्षमता निर्माण आयोग (CBC) • National Capability Intelligence Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
              <Sparkles size={14} className="text-[#ff9933]" />
              <span>Smart India Hackathon 2026</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-[#0b2545] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#13315c] transition-all shadow-md shadow-[#0b2545]/20 flex items-center gap-2"
            >
              <span>Jan Parichay Portal Login</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Government of India Official Splendor) */}
      <section className="bg-gradient-to-br from-[#061527] via-[#0b2545] to-[#13315c] text-white relative overflow-hidden py-20 px-6 border-b-4 border-[#ff9933]">
        {/* Subtle geometric Ashoka watermark */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 opacity-5 pointer-events-none">
          <StateEmblem className="w-full h-full" color="#ffffff" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-amber-300/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold mb-6 backdrop-blur-xs">
            <Building2 size={13} />
            <span>Mission Karmayogi • FRAC Competency Architecture</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-serif">
            सशक्त लोकसेवक, समर्थ राष्ट्र।
            <br />
            <span className="gold-gradient-text">
              National Capability Intelligence
            </span>
          </h2>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mt-6 leading-relaxed font-normal">
            Moving beyond course completion counters to measurable, certified workforce competency. Driving predictive organizational readiness across ministries, departments, and public institutions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-[#ff9933] to-[#e06d00] text-slate-950 px-8 py-4 rounded-2xl font-black text-sm hover:brightness-105 transition-all shadow-xl shadow-orange-950/30 flex items-center gap-2"
            >
              <span>Launch Live Competency Engine</span>
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('closed-loop-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 border border-white/20 text-white px-7 py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all backdrop-blur-xs"
            >
              Inspect Closed-Loop Architecture
            </button>
          </div>
        </div>

        {/* 4. National Statistics Banner */}
        <div className="max-w-6xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          {NATIONAL_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-left hover:border-amber-300/40 transition-colors"
            >
              <p className="text-[10px] font-bold text-amber-300/90 uppercase tracking-wider">{stat.labelHi}</p>
              <p className="text-3xl font-black text-white mt-1 tracking-tight">{stat.value}</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">{stat.label}</p>
              <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                <span>{stat.change}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Closed-Loop Demonstration Architecture */}
      <section id="closed-loop-section" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#c69214] uppercase tracking-widest">
            प्रमाणित कार्यप्रवाह | Verifiable End-to-End Architecture
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            The Closed-Loop Competency Improvement Lifecycle
          </h2>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            Unlike static LMS platforms that record attendance without proving skill acquisition, Capacity Connect enforces an accountable closed loop from gap diagnosis to executive analytics.
          </p>
        </div>

        {/* Interactive Step Timeline Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-12">
          {[
            {
              step: '01',
              title: 'Role Gap Diagnosis',
              desc: 'Identifies employee baseline vs required FRAC competency threshold (e.g. Arjun: 42 vs 75 req).',
              badge: 'Diagnostic',
              color: 'border-red-300 bg-red-50/50',
            },
            {
              step: '02',
              title: 'Targeted e-Learning',
              desc: 'Prescribes high-yield learning modules specifically mapped to the detected gap area.',
              badge: 'Intervention',
              color: 'border-amber-300 bg-amber-50/50',
            },
            {
              step: '03',
              title: 'Proctored Assessment',
              desc: 'Enforces rigorous question-level testing to evaluate hands-on conceptual mastery.',
              badge: 'Examination',
              color: 'border-blue-300 bg-blue-50/50',
            },
            {
              step: '04',
              title: 'Verified Competency Boost',
              desc: 'Dynamically upgrades the employee score (42% → 85%) and mints a verified GoI Certificate.',
              badge: 'Accreditation',
              color: 'border-emerald-300 bg-emerald-50/50',
            },
            {
              step: '05',
              title: 'Enterprise Analytics Lift',
              desc: 'Team matrix turns green, department index rises, and critical organizational risk alerts resolve.',
              badge: 'Executive ROI',
              color: 'border-purple-300 bg-purple-50/50',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-3xl border ${item.color} shadow-xs flex flex-col justify-between hover:shadow-md transition-all`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#0b2545] font-mono">{item.step}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1 text-[11px] font-bold text-[#0b2545]">
                <span>Phase {idx + 1}</span>
                <ChevronRight size={12} />
              </div>
            </div>
          ))}
        </div>

        {/* Live Simulation Quick-Access for Judges */}
        <div className="bg-gradient-to-r from-[#0b2545] to-[#13315c] rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-amber-300/30">
          <div>
            <span className="text-xs font-black text-[#ff9933] uppercase tracking-wider">
              Hackathon Evaluation Mode
            </span>
            <h3 className="text-2xl font-black mt-1 font-serif">
              Ready to test the live Employee → Competency Upgrade flow?
            </h3>
            <p className="text-xs text-slate-300 mt-2 max-w-xl">
              Log in as Arjun Sharma (Learner), take the proctored assessment, watch the competency upgrade, and switch to Manager Meera Nair & Admin User to see live organizational impact.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#ff9933] text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs hover:brightness-105 transition-all shadow-md flex items-center gap-2"
            >
              <span>Launch Demo Personas</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Core Framework Features */}
      <section className="bg-white py-20 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#c69214] uppercase tracking-widest">
              राष्ट्रीय क्षमता स्तंभ | Mission Karmayogi Architecture
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2">
              Built for Civil Services & Public Sector Excellence
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FRAC_PILLARS.map((p, i) => (
              <div
                key={i}
                className="gov-card p-7 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {p.icon}
                  </div>
                  <p className="text-[10px] font-bold text-[#c69214] uppercase tracking-wider">{p.titleHi}</p>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{p.title}</h3>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Official Portal Footer */}
      <footer className="bg-[#061527] text-slate-400 py-12 px-6 border-t-2 border-[#ff9933]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 pb-10 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <StateEmblem className="w-8 h-10" color="#ffffff" />
              <div>
                <p className="text-sm font-bold text-white leading-tight">CAPACITY CONNECT</p>
                <p className="text-[11px] text-amber-300">क्षमता संयोजिका पोर्टल</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              An intelligent organizational capability and competency intelligence system developed for Smart India Hackathon 2026.
            </p>
          </div>

          <div className="text-xs space-y-2">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Governing Bodies</p>
            <p>• Capacity Building Commission (CBC)</p>
            <p>• Ministry of Personnel, Public Grievances and Pensions</p>
            <p>• Digital India Corporation (DIC)</p>
            <p>• Mission Karmayogi Bharat</p>
          </div>

          <div className="text-xs space-y-2">
            <p className="text-xs font-bold text-white uppercase tracking-wider">GIGW Compliance & Security</p>
            <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <FileCheck2 size={13} /> GIGW 3.0 Standard Certified
            </p>
            <p className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck size={13} /> CERT-In Security Guidelines Compliant
            </p>
            <p className="text-[11px] text-slate-500 mt-3">
              Password for all demonstration accounts: <span className="font-mono text-amber-300 font-bold">demo123</span>
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Government of India. All rights reserved.</p>
          <p>Designed for Smart India Hackathon 2026 — Public Sector Capacity Building</p>
        </div>
      </footer>
    </div>
  );
}
