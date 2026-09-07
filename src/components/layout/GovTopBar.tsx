import { useCapacity } from '../../context/CapacityContext';
import { Globe, Eye, Volume2, ShieldCheck, Menu, Sun, Moon, Monitor, Palette } from 'lucide-react';

export function StateEmblemSvg({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor" aria-label="State Emblem of India">
      {/* Stylized Lion Capital of Ashoka representation */}
      <circle cx="50" cy="20" r="12" opacity="0.9" />
      <path d="M30 36 C35 24, 65 24, 70 36 C75 52, 65 65, 50 68 C35 65, 25 52, 30 36 Z" opacity="0.95" />
      {/* Central pillar abacus */}
      <rect x="26" y="70" width="48" height="12" rx="3" />
      {/* Ashoka Chakra in center of base */}
      <circle cx="50" cy="76" r="4.5" fill="#ffffff" />
      <circle cx="50" cy="76" r="2.5" fill="currentColor" />
      {/* Base tier with Satyameva Jayate motif */}
      <path d="M20 86 L80 86 L74 98 L26 98 Z" />
      <rect x="22" y="101" width="56" height="4" rx="1.5" opacity="0.8" />
    </svg>
  );
}

export default function GovTopBar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const {
    language,
    setLanguage,
    textScale,
    setTextScale,
    highContrast,
    setHighContrast,
    themeMode,
    setThemeMode,
    colorAccessibility,
    setColorAccessibility,
    t,
  } = useCapacity();

  return (
    <header className="w-full bg-[#061527] text-slate-300 text-xs border-b border-slate-800/80 select-none z-50">
      {/* National Tricolor Micro-Ribbon */}
      <div className="tricolor-ribbon" />

      {/* Main GIGW Utility Strip */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Official Authority Notice */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Open navigation menu"
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-2 text-white font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff9933] inline-block animate-pulse" />
            <span className="font-semibold tracking-wide text-white text-[11px]">
              {t('common.govtOfIndia')}
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline text-[11px]">
              {t('common.cbc')}
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-[#ff9933] hidden md:inline text-[11px] font-medium">
              {t('common.missionKarmayogi')}
            </span>
          </div>
        </div>

        {/* Right: Accessibility Controls & GIGW Compliances */}
        <div className="flex items-center gap-2 text-[11px] flex-wrap justify-end">
          <span className="sr-only">{t('common.accessibilitySettings')}</span>

          {/* Theme preference */}
          <div
            className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 gap-0.5"
            role="group"
            aria-label={t('common.darkMode')}
          >
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              aria-label={t('common.light')}
              aria-pressed={themeMode === 'light'}
              className={`p-1.5 rounded-md transition-all ${themeMode === 'light' ? 'bg-white text-[#0b2545]' : 'text-slate-400 hover:text-white'}`}
              title={t('common.light')}
            >
              <Sun size={13} />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              aria-label={t('common.dark')}
              aria-pressed={themeMode === 'dark'}
              className={`p-1.5 rounded-md transition-all ${themeMode === 'dark' ? 'bg-slate-950 text-amber-300' : 'text-slate-400 hover:text-white'}`}
              title={t('common.dark')}
            >
              <Moon size={13} />
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('system')}
              aria-label={t('common.system')}
              aria-pressed={themeMode === 'system'}
              className={`p-1.5 rounded-md transition-all ${themeMode === 'system' ? 'bg-[#0b2545] text-white' : 'text-slate-400 hover:text-white'}`}
              title={t('common.system')}
            >
              <Monitor size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setColorAccessibility(v => !v)}
            aria-pressed={colorAccessibility}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors ${
              colorAccessibility
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                : 'border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title={t('common.colourAccessibility')}
          >
            <Palette size={13} />
            <span className="hidden sm:inline">{t('common.colourAccessibility')}</span>
          </button>

          {/* Screen Reader Access */}
          <button
            onClick={() => {}}
            className="hidden lg:flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            title="Screen Reader Accessible (GIGW Compliant)"
          >
            <Volume2 size={13} />
            <span>{t('common.screenReader')}</span>
          </button>

          {/* Text Size Scaling */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
            <button
              onClick={() => setTextScale('normal')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                textScale === 'normal' ? 'bg-[#0b2545] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Standard font size (100%)"
            >
              A-
            </button>
            <button
              onClick={() => setTextScale('large')}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                textScale === 'large' ? 'bg-[#0b2545] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Large font size (108%)"
            >
              A
            </button>
            <button
              onClick={() => setTextScale('larger')}
              className={`px-1.5 py-0.5 rounded text-[12px] font-bold ${
                textScale === 'larger' ? 'bg-[#0b2545] text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Extra large font size (116%)"
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(v => !v)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-colors ${
              highContrast
                ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                : 'border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Toggle High Contrast Mode"
          >
            <Eye size={12} />
            <span className="hidden sm:inline">
              {highContrast ? t('common.standardContrast') : t('common.highContrast')}
            </span>
          </button>

          {/* Language Selector: Explicit English / Hindi segmented control */}
          <div
            className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60 gap-0.5"
            role="group"
            aria-label="Language selection"
          >
            <Globe size={12} className="text-amber-400 mx-1 flex-shrink-0" />
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all ${
                language === 'en'
                  ? 'bg-[#0b2545] text-amber-300 shadow-xs border border-amber-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Select English"
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all ${
                language === 'hi'
                  ? 'bg-[#0b2545] text-amber-300 shadow-xs border border-amber-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="हिन्दी चुनें"
            >
              हिन्दी
            </button>
          </div>

          {/* Smart India Hackathon 2026 Seal */}
          <div className="hidden xl:flex items-center gap-1 text-[10px] text-teal-400 font-semibold pl-2 border-l border-slate-700/60">
            <ShieldCheck size={12} />
            <span>SIH 2026</span>
          </div>
        </div>
      </div>
    </header>
  );
}

