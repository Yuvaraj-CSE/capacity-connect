import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import { assessments } from '../data/mockData';
import type { Assessment } from '../types';
import { ProgressBar, OfficialCertificate, StateEmblem } from '../components/ui/SharedComponents';
import {
  Target, Clock, CheckCircle2, XCircle, Award,
  ChevronRight, ChevronLeft, RotateCcw, X, ArrowRight,
  ShieldCheck, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface QuizState {
  assessment: Assessment;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  timeRemaining: number;
  isSubmitted: boolean;
  score: number;
  passed: boolean;
}

export default function AssessmentsPage() {
  const { user } = useAuth();
  const {
    competenciesByUser,
    improveCompetencyAfterAssessment,
    isLoopCompleted,
  } = useCapacity();
  const navigate = useNavigate();

  const [activeQuiz, setActiveQuiz] = useState<QuizState | null>(null);
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, { score: number; passed: boolean }>>({});
  const [celebrationData, setCelebrationData] = useState<{
    oldScore: number;
    newScore: number;
    certUid: string;
    compName: string;
  } | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  function startQuiz(assessment: Assessment) {
    setActiveQuiz({
      assessment,
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: assessment.duration * 60,
      isSubmitted: false,
      score: 0,
      passed: false,
    });
  }

  // Timer countdown
  useEffect(() => {
    if (!activeQuiz || activeQuiz.isSubmitted) return;
    const interval = setInterval(() => {
      setActiveQuiz(prev => {
        if (!prev) return null;
        if (prev.timeRemaining <= 1) {
          clearInterval(interval);
          return calculateResult(prev);
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz?.isSubmitted]);

  if (!user) return null;

  const userComps = competenciesByUser[user.id] || [];
  const priorityComp = userComps.reduce((largest, competency) => {
    if (!largest) return competency;
    return competency.required - competency.current > largest.required - largest.current ? competency : largest;
  }, userComps[0]);

  function handleSelectOption(questionId: string, optionIndex: number) {
    if (!activeQuiz || activeQuiz.isSubmitted) return;
    setActiveQuiz(prev =>
      prev ? { ...prev, answers: { ...prev.answers, [questionId]: optionIndex } } : null
    );
  }

  function calculateResult(quiz: QuizState): QuizState {
    let correctCount = 0;
    quiz.assessment.questions.forEach(q => {
      if (quiz.answers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / quiz.assessment.questions.length) * 100);
    const passed = score >= quiz.assessment.passingScore;

    setCompletedQuizzes(prev => ({
      ...prev,
      [quiz.assessment.id]: { score, passed },
    }));

    if (passed) {
      // 🚀 CLOSED LOOP TRIGGER: Upgrade score in global context!
      const result = improveCompetencyAfterAssessment(user!.id, quiz.assessment.competencyId, score);
      const targetComp = userComps.find(c => c.id === quiz.assessment.competencyId);

      setCelebrationData({
        oldScore: result.oldScore,
        newScore: result.newScore,
        certUid: result.certificate.id,
        compName: targetComp?.name || 'Competency',
      });

      toast.success(
        `Accreditation Achieved! ${targetComp?.name || 'Competency'} upgraded from ${result.oldScore}% to ${result.newScore}%!`,
        { icon: '🏛️', duration: 5000 }
      );
    } else {
      toast.error(`Score: ${score}%. Required pass threshold is ${quiz.assessment.passingScore}%.`);
    }

    return {
      ...quiz,
      isSubmitted: true,
      score,
      passed,
    };
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c69214] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              National Examination Protocol • GIGW Standard
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0b2545] tracking-tight">
            Competency Assessments & Proctored Tests
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Rigorous evaluations that directly upgrade certified capability ratings on official government registers
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <StateEmblem className="w-7 h-9 flex-shrink-0" />
          <div className="border-l border-slate-200 pl-3">
            <p className="text-xs font-bold text-slate-900">
              {Object.keys(completedQuizzes).length || (isLoopCompleted ? 1 : 0)} of {assessments.length} Completed
            </p>
            <p className="text-[10px] text-emerald-700 font-bold">FRAC Accredited</p>
          </div>
        </div>
      </div>

      {/* Closed-Loop Prompt */}
      {!isLoopCompleted && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles size={18} className="text-[#ff9933] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Step 3 of Closed-Loop Lifecycle: Pass the Assessment
            </p>
            <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
              Select the assessment linked to your largest gap in <strong>{priorityComp?.name || 'your priority competency'}</strong>. A passing score will update your verified capability, issue a certificate, and recalculate team analytics from the same data.
            </p>
          </div>
        </div>
      )}

      {/* Assessment Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {assessments.map(item => {
          const comp = userComps.find(c => c.id === item.competencyId);
          const pastResult = completedQuizzes[item.id] || (item.id === 'a1' && isLoopCompleted ? { score: 87, passed: true } : null);

          return (
            <div
              key={item.id}
              className="gov-card p-7 flex flex-col justify-between border-slate-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#0b2545]/10 text-[#0b2545] rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#0b2545]/20">
                    <Target size={24} />
                  </div>
                  {pastResult ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        pastResult.passed
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-red-50 text-red-800 border border-red-300'
                      }`}
                    >
                      <ShieldCheck size={13} />
                      {pastResult.passed ? `Accredited (${pastResult.score}%)` : `Retake Required (${pastResult.score}%)`}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-[#c69214] border border-amber-200">
                      Examination Available
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                  Evaluates target proficiency in <strong className="text-slate-800">{comp?.name || 'Competency'}</strong>. Passing score is <strong className="text-[#0b2545]">{item.passingScore}%</strong> to earn the official accreditation.
                </p>

                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl mb-6 text-center text-xs border border-slate-200/60">
                  <div>
                    <p className="text-slate-400 font-medium">Duration</p>
                    <p className="font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                      <Clock size={12} /> {item.duration}m
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Questions</p>
                    <p className="font-bold text-slate-800 mt-0.5">{item.questions.length} Items</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Pass Threshold</p>
                    <p className="font-bold text-slate-800 mt-0.5">{item.passingScore}%</p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => startQuiz(item)}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    pastResult?.passed
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                      : 'bg-[#0b2545] text-white hover:bg-[#13315c] shadow-[#0b2545]/20'
                  }`}
                >
                  {pastResult?.passed ? (
                    <>
                      <span>Retake Proctored Test</span>
                      <RotateCcw size={14} />
                    </>
                  ) : (
                    <>
                      <span>Start Proctored Examination</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Celebratory Post-Assessment Modal (Closed-Loop Payoff) */}
      {celebrationData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-2 border-emerald-400 overflow-hidden flex flex-col p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border-2 border-emerald-300 mx-auto flex items-center justify-center text-emerald-700 mb-4 shadow-sm">
              <Award size={36} />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 w-fit mx-auto">
              National Accreditation Verified
            </span>

            <h3 className="text-2xl font-black text-slate-900 mt-3 font-serif">
              Competency Deficit Successfully Resolved!
            </h3>

            <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              {user.name} has officially met the required benchmark for <strong className="text-slate-900">{celebrationData.compName}</strong> under the Mission Karmayogi civil service framework.
            </p>

            {/* Score Delta Display */}
            <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-around text-center">
              <div>
                <p className="text-xs text-slate-400 font-semibold">Prior Level</p>
                <p className="text-2xl font-black text-red-500">{celebrationData.oldScore}%</p>
                <span className="text-[10px] text-red-600 font-bold">Before verification</span>
              </div>
              <div className="text-2xl text-slate-400 font-bold">➔</div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Verified Level</p>
                <p className="text-2xl font-black text-emerald-600">{celebrationData.newScore}%</p>
                <span className="text-[10px] text-emerald-700 font-bold">Verified result ✓</span>
              </div>
            </div>

            {/* Next Steps in Closed-Loop Guide */}
            <div className="bg-blue-50/80 rounded-2xl p-4 text-left border border-blue-200 mb-6 text-xs text-blue-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-600" />
                <span>Next in Closed-Loop Demonstration:</span>
              </p>
              <p className="text-blue-900/80 text-[11px]">
                1. Switch to <strong>Meera Nair (Manager)</strong> to verify that Arjun's cell in the Team Competency Matrix has turned green.
              </p>
              <p className="text-blue-900/80 text-[11px]">
                2. Switch to <strong>Admin User</strong> to observe the enterprise capability index lift and risk alert resolution.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCelebrationData(null);
                  setShowCertModal(true);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#0b2545] text-amber-300 text-xs font-bold rounded-xl hover:bg-[#13315c] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Award size={15} />
                <span>View Government Certificate</span>
              </button>
              <button
                onClick={() => {
                  setCelebrationData(null);
                  navigate('/team');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#ff9933] text-slate-950 text-xs font-black rounded-xl hover:bg-[#e06d00] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Inspect Team Matrix</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quiz Runner Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
            {/* Examination Header */}
            <div className="bg-[#061527] text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <StateEmblem className="w-6 h-8" color="#ff9933" />
                <div>
                  <span className="text-[10px] text-[#ff9933] font-bold uppercase tracking-wider">
                    Government of India • Proctored Assessment
                  </span>
                  <h2 className="text-base font-bold text-white leading-tight">{activeQuiz.assessment.title}</h2>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!activeQuiz.isSubmitted && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl font-mono text-xs text-amber-300 font-bold border border-slate-700">
                    <Clock size={13} />
                    {formatTime(activeQuiz.timeRemaining)}
                  </div>
                )}
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Test Form Content */}
            {!activeQuiz.isSubmitted ? (
              <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>
                      Question {activeQuiz.currentQuestionIndex + 1} of {activeQuiz.assessment.questions.length}
                    </span>
                    <span>
                      {Math.round(
                        ((activeQuiz.currentQuestionIndex + 1) / activeQuiz.assessment.questions.length) * 100
                      )}
                      % Progress
                    </span>
                  </div>
                  <ProgressBar
                    value={
                      ((activeQuiz.currentQuestionIndex + 1) / activeQuiz.assessment.questions.length) * 100
                    }
                    color="blue"
                    size="sm"
                  />

                  {(() => {
                    const curQuestion = activeQuiz.assessment.questions[activeQuiz.currentQuestionIndex];
                    const selectedOpt = activeQuiz.answers[curQuestion.id];

                    return (
                      <div className="mt-6 space-y-5">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
                          {curQuestion.text}
                        </h3>

                        <div className="space-y-3">
                          {curQuestion.options.map((optionText, optIdx) => {
                            const isSelected = selectedOpt === optIdx;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectOption(curQuestion.id, optIdx)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                                  isSelected
                                    ? 'bg-[#0b2545]/5 border-[#0b2545] ring-2 ring-[#0b2545]/20 text-[#0b2545] font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                                    isSelected
                                      ? 'bg-[#0b2545] text-white border-[#0b2545]'
                                      : 'border-slate-300 text-slate-500'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </div>
                                <span className="text-xs md:text-sm">{optionText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                  <button
                    onClick={() =>
                      setActiveQuiz(prev =>
                        prev ? { ...prev, currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1) } : null
                      )
                    }
                    disabled={activeQuiz.currentQuestionIndex === 0}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  {activeQuiz.currentQuestionIndex < activeQuiz.assessment.questions.length - 1 ? (
                    <button
                      onClick={() =>
                        setActiveQuiz(prev =>
                          prev ? { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 } : null
                        )
                      }
                      className="flex items-center gap-1 px-6 py-2.5 bg-[#0b2545] text-white rounded-xl text-xs font-bold hover:bg-[#13315c] transition-colors shadow-sm"
                    >
                      <span>Next Question</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveQuiz(prev => (prev ? calculateResult(prev) : null))}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-[#ff9933] text-slate-950 rounded-xl text-xs font-black hover:bg-[#e06d00] transition-colors shadow-md"
                    >
                      <CheckCircle2 size={16} />
                      <span>Submit Examination</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Examination Review */
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
                <div
                  className={`p-6 rounded-3xl text-center ${
                    activeQuiz.passed
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                      : 'bg-red-50 border border-red-300 text-red-950'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3 shadow-xs bg-white">
                    {activeQuiz.passed ? (
                      <CheckCircle2 size={32} className="text-emerald-600" />
                    ) : (
                      <XCircle size={32} className="text-red-500" />
                    )}
                  </div>
                  <h3 className="text-2xl font-black">
                    {activeQuiz.passed ? 'Examination Passed & Accredited!' : 'Examination Not Cleared'}
                  </h3>
                  <p className="text-sm font-semibold mt-1">
                    Your Score: <span className="text-2xl font-black">{activeQuiz.score}%</span> • Passing Benchmark: {activeQuiz.assessment.passingScore}%
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Official Question Review & Explanations
                  </h4>
                  <div className="space-y-3">
                    {activeQuiz.assessment.questions.map((q, idx) => {
                      const userAns = activeQuiz.answers[q.id];
                      const isCorrect = userAns === q.correctIndex;
                      return (
                        <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs md:text-sm font-bold text-slate-900">
                              {idx + 1}. {q.text}
                            </p>
                            {isCorrect ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                ✓ Correct
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                ✗ Incorrect
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 space-y-0.5">
                            <p>Your response: <strong className={isCorrect ? 'text-emerald-700' : 'text-red-600'}>{userAns !== undefined ? q.options[userAns] : 'None'}</strong></p>
                            {!isCorrect && <p>Correct answer: <strong className="text-emerald-700">{q.options[q.correctIndex]}</strong></p>}
                          </div>
                          <p className="text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 text-slate-600 mt-1">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="px-6 py-2.5 bg-[#0b2545] text-white rounded-xl text-xs font-bold hover:bg-[#13315c]"
                  >
                    Done & Return to Assessments
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Government Certificate Modal */}
      {showCertModal && (
        <OfficialCertificate
          title="Certified Data Analytics Specialist"
          recipientName={user.name}
          recipientPosition={user.position}
          score={userComps.find(c => c.id === 'c2')?.current || 85}
          issuedDate={new Date().toISOString().slice(0, 10)}
          uid={`GOI-CBC-${Date.now().toString().slice(-6)}`}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}
