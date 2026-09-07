export type LanguageMode = 'en' | 'hi';

export interface TranslationDictionary {
  navigation: {
    dashboard: string;
    competencyProfile: string;
    capabilityJourney: string;
    courseCatalogue: string;
    knowledgeHub: string;
    assessments: string;
    teamAnalytics: string;
    orgAnalytics: string;
    capabilityAlerts: string;
    administration: string;
  };
  common: {
    govtOfIndia: string;
    cbc: string;
    missionKarmayogi: string;
    nationalPortal: string;
    slogan: string;
    screenReader: string;
    standardContrast: string;
    highContrast: string;
    accessibilitySettings: string;
    darkMode: string;
    colourAccessibility: string;
    light: string;
    dark: string;
    system: string;
    english: string;
    hindi: string;
    signOut: string;
    switchDemoPersona: string;
    testAccessTiers: string;
    resetFlow: string;
    hideBanner: string;
    nationalCompetencyLifecycle: string;
    closedLoopVerified: string;
    liveSimulationReady: string;
    lifecycleSummary: string;
    searchPlaceholder: string;
    viewDetails: string;
    status: string;
    actions: string;
    back: string;
    submit: string;
    cancel: string;
    close: string;
    loading: string;
    all: string;
    department: string;
    score: string;
    level: string;
    competencyFramework: string;
  };
  roles: {
    gazettedOfficer: string;
    headOfDepartment: string;
    chiefAdministrator: string;
    learner: string;
    manager: string;
    admin: string;
    gazettedBadge: string;
    hodBadge: string;
    adminBadge: string;
  };
  sections: {
    competencyRadar: string;
    gapAnalysis: string;
    detailedAnalysis: string;
    competencyAnalysis: string;
    activeCourses: string;
    certificateDirectory: string;
    departmentalProgress: string;
    trainingImpact: string;
    ministryScorecard: string;
    teamMatrix: string;
    criticalAlerts: string;
  };
  steps: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
  };
}

export const translations: Record<LanguageMode, TranslationDictionary> = {
  en: {
    navigation: {
      dashboard: 'Dashboard',
      competencyProfile: 'Competency Profile',
      capabilityJourney: 'Capability Journey',
      courseCatalogue: 'Course Catalogue',
      knowledgeHub: 'Knowledge Hub',
      assessments: 'Assessments',
      teamAnalytics: 'Team Analytics',
      orgAnalytics: 'Org Analytics',
      capabilityAlerts: 'Capability Alerts',
      administration: 'Administration',
    },
    common: {
      govtOfIndia: 'Government of India',
      cbc: 'Capacity Building Commission (CBC)',
      missionKarmayogi: 'Mission Karmayogi',
      nationalPortal: 'National Capability Intelligence Portal',
      slogan: 'Empowered Civil Servants, Capable Nation',
      screenReader: 'Screen Reader',
      standardContrast: 'Standard',
      highContrast: 'Contrast',
      accessibilitySettings: 'Accessibility settings',
      darkMode: 'Dark mode',
      colourAccessibility: 'Colour accessibility',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      english: 'English',
      hindi: 'हिन्दी',
      signOut: 'Sign Out',
      switchDemoPersona: 'Switch Demo Persona',
      testAccessTiers: 'Test different government access tiers',
      resetFlow: 'Reset Flow',
      hideBanner: 'Hide mission banner',
      nationalCompetencyLifecycle: 'National Competency Lifecycle',
      closedLoopVerified: 'Closed-Loop Verified ✓',
      liveSimulationReady: 'Live Simulation Ready',
      lifecycleSummary: 'Employee Gap Identified ➔ Targeted e-Learning ➔ Proctored Exam ➔ Certified Score Boost ➔ Admin Analytics Lift',
      searchPlaceholder: 'Search...',
      viewDetails: 'View Details',
      status: 'Status',
      actions: 'Actions',
      back: 'Back',
      submit: 'Submit',
      cancel: 'Cancel',
      close: 'Close',
      loading: 'Loading...',
      all: 'All',
      department: 'Department',
      score: 'Score',
      level: 'Level',
      competencyFramework: 'Competency Framework',
    },
    roles: {
      gazettedOfficer: 'Gazetted Officer',
      headOfDepartment: 'Head of Department',
      chiefAdministrator: 'Chief Administrator',
      learner: 'Learner (Engineer)',
      manager: 'Manager (Eng Head)',
      admin: 'Director (T&D)',
      gazettedBadge: 'Gazetted',
      hodBadge: 'HoD',
      adminBadge: 'Admin',
    },
    sections: {
      competencyRadar: 'Competency Radar',
      gapAnalysis: 'Gap Analysis',
      detailedAnalysis: 'Detailed Analysis',
      competencyAnalysis: 'Competency Analysis',
      activeCourses: 'Active Courses',
      certificateDirectory: 'Certificate Directory',
      departmentalProgress: 'Departmental Progress',
      trainingImpact: 'Training Impact',
      ministryScorecard: 'Ministry & Department Scorecard',
      teamMatrix: 'Team Competency Matrix',
      criticalAlerts: 'Capability Risk Alerts',
    },
    steps: {
      step1: 'Skill Gap Identified',
      step2: 'Targeted e-Learning',
      step3: 'Proctored Assessment',
      step4: 'Competency Certification',
      step5: 'Administrative & Team Impact',
    },
  },
  hi: {
    navigation: {
      dashboard: 'डैशबोर्ड',
      competencyProfile: 'दक्षता प्रोफाइल',
      capabilityJourney: 'क्षमता यात्रा',
      courseCatalogue: 'पाठ्यक्रम सूची',
      knowledgeHub: 'ज्ञान केंद्र',
      assessments: 'मूल्यांकन',
      teamAnalytics: 'टीम विश्लेषण',
      orgAnalytics: 'संगठन विश्लेषण',
      capabilityAlerts: 'क्षमता अलर्ट',
      administration: 'प्रशासन',
    },
    common: {
      govtOfIndia: 'भारत सरकार',
      cbc: 'क्षमता निर्माण आयोग (CBC)',
      missionKarmayogi: 'मिशन कर्मयोगी',
      nationalPortal: 'राष्ट्रीय क्षमता आसूचना पोर्टल',
      slogan: 'सशक्त लोकसेवक, समर्थ राष्ट्र।',
      screenReader: 'स्क्रीन रीडर',
      standardContrast: 'सामान्य',
      highContrast: 'कंट्रास्ट',
      accessibilitySettings: 'सुलभता सेटिंग्स',
      darkMode: 'डार्क मोड',
      colourAccessibility: 'रंग सुलभता',
      light: 'लाइट',
      dark: 'डार्क',
      system: 'सिस्टम',
      english: 'English',
      hindi: 'हिन्दी',
      signOut: 'साइन आउट',
      switchDemoPersona: 'डेमो उपयोगकर्ता बदलें',
      testAccessTiers: 'विभिन्न सरकारी पहुंच स्तरों का परीक्षण करें',
      resetFlow: 'रीसेट करें',
      hideBanner: 'बैनर छुपाएं',
      nationalCompetencyLifecycle: 'राष्ट्रीय दक्षता जीवनचक्र',
      closedLoopVerified: 'क्लोज्ड-लूप सत्यापित ✓',
      liveSimulationReady: 'लाइव सिमुलेशन तैयार',
      lifecycleSummary: 'कर्मचारी अंतराल पहचान ➔ लक्षित ई-लर्निंग ➔ प्रमाणित परीक्षा ➔ योग्यता प्रमाणीकरण ➔ प्रशासनिक विश्लेषण',
      searchPlaceholder: 'खोजें...',
      viewDetails: 'विवरण देखें',
      status: 'स्थिति',
      actions: 'कार्रवाई',
      back: 'वापस',
      submit: 'जमा करें',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      loading: 'लोड हो रहा है...',
      all: 'सभी',
      department: 'विभाग',
      score: 'प्राप्तांक',
      level: 'स्तर',
      competencyFramework: 'दक्षता ढांचा',
    },
    roles: {
      gazettedOfficer: 'राजपत्रित अधिकारी',
      headOfDepartment: 'विभागाध्यक्ष',
      chiefAdministrator: 'मुख्य प्रशासक',
      learner: 'प्रशिक्षु (इंजीनियर)',
      manager: 'प्रबंधक (विभागाध्यक्ष)',
      admin: 'निदेशक (प्रशिक्षण एवं विकास)',
      gazettedBadge: 'राजपत्रित',
      hodBadge: 'विभागाध्यक्ष',
      adminBadge: 'मुख्य प्रशासक',
    },
    sections: {
      competencyRadar: 'दक्षता रडार',
      gapAnalysis: 'अंतराल विश्लेषण',
      detailedAnalysis: 'विस्तृत विश्लेषण',
      competencyAnalysis: 'दक्षता विश्लेषण',
      activeCourses: 'सक्रिय पाठ्यक्रम',
      certificateDirectory: 'प्रमाण-पत्र सूची',
      departmentalProgress: 'विभागीय प्रगति',
      trainingImpact: 'प्रशिक्षण प्रभाव',
      ministryScorecard: 'मंत्रालय व विभाग स्कोरकार्ड',
      teamMatrix: 'टीम दक्षता मैट्रिक्स',
      criticalAlerts: 'दक्षता जोखिम अलर्ट',
    },
    steps: {
      step1: 'दक्षता अंतराल पहचान',
      step2: 'लक्षित ई-लर्निंग',
      step3: 'प्रमाणित मूल्यांकन',
      step4: 'योग्यता प्रमाणीकरण',
      step5: 'प्रशासनिक व टीम प्रभाव',
    },
  },
};

/**
 * Resolve dot-notation path in dictionary (e.g. 'navigation.dashboard')
 */
export function translate(lang: LanguageMode, path: string, fallback?: string): string {
  const parts = path.split('.');
  // Primary lookup in selected language
  let current: any = translations[lang] || translations['en'];
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      current = undefined;
      break;
    }
  }
  if (typeof current === 'string') return current;

  // Fallback to English if missing in target language
  if (lang !== 'en') {
    let enCurrent: any = translations['en'];
    for (const part of parts) {
      if (enCurrent && typeof enCurrent === 'object' && part in enCurrent) {
        enCurrent = enCurrent[part];
      } else {
        enCurrent = undefined;
        break;
      }
    }
    if (typeof enCurrent === 'string') return enCurrent;
  }

  return fallback || path;
}
