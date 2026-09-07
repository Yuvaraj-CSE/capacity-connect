import { useState, useRef, useEffect } from 'react';
import { Zap, X, Send, ChevronDown } from 'lucide-react';
import { courses, users } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useCapacity } from '../context/CapacityContext';
import type { Competency, Enrollment } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: 'My skill gaps', key: 'gap' },
  { label: 'Recommend courses', key: 'recommend' },
  { label: 'Data analytics path', key: 'data' },
  { label: 'Team insights', key: 'team' },
];

function getAIResponse(input: string, competencies: Competency[], enrollments: Enrollment[], userId: string): string {
  const lower = input.toLowerCase();
  const gaps = competencies
    .map(competency => ({ competency, gap: Math.max(0, competency.required - competency.current) }))
    .sort((a, b) => b.gap - a.gap);
  const priority = gaps[0];
  const recommendedCourses = priority
    ? courses.filter(course => course.competencyIds.includes(priority.competency.id)).slice(0, 3)
    : [];
  const activeCourses = enrollments
    .filter(enrollment => enrollment.userId === userId && enrollment.progress < 100)
    .map(enrollment => courses.find(course => course.id === enrollment.courseId)?.title)
    .filter(Boolean);

  if (lower.includes('team') || lower.includes('department') || lower.includes('colleague')) {
    const teamMembers = users.filter(candidate => candidate.department === users.find(item => item.id === userId)?.department && candidate.role === 'learner');
    return `**Team capability view**\n\nI found ${teamMembers.length} learner profiles in your department. The most useful intervention is to compare each member's largest gap with the shared course catalogue, then assign targeted learning rather than a general course. This answer is based on the platform's competency data.`;
  }
  if (lower.includes('why') && priority) {
    return `**Why this course is recommended**\n\n${recommendedCourses[0]?.title || 'A targeted learning module'} is linked to **${priority.competency.name}**, where your current score is **${priority.competency.current}/100** against a required **${priority.competency.required}/100**. That is a **${priority.gap}-point gap**, so it is the highest-impact next step in your profile.`;
  }
  if (lower.includes('gap') || lower.includes('skill') || lower.includes('shortage')) {
    return priority && priority.gap > 0
      ? `**Your biggest skill gap**\n\n**${priority.competency.name}: ${priority.gap} points** (${priority.competency.current} current vs ${priority.competency.required} required). ${gaps.filter(item => item.gap > 0).length} competencies need development. This response is calculated from your current competency profile.`
      : 'Your tracked competencies currently meet their role benchmarks. Keep your learning record current through periodic assessments.';
  }
  if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('next') || lower.includes('learn')) {
    return priority && priority.gap > 0
      ? `**Your recommended next step**\n\nFocus on **${priority.competency.name}** first. Suggested learning: ${recommendedCourses.map(course => `\n- **${course.title}**`).join('') || '\n- Review the competency resources in Knowledge Hub' }\n\nYou already have ${activeCourses.length} active course${activeCourses.length === 1 ? '' : 's'} in your learning record.`
      : 'Your profile is on track. Choose a course that strengthens your role goals, then validate the improvement with its linked assessment.';
  }
  if (lower.includes('data') || lower.includes('analytic') || lower.includes('leadership') || lower.includes('lead')) {
    const matching = gaps.find(item => item.competency.name.toLowerCase().includes(lower.includes('lead') ? 'lead' : 'data')) || priority;
    return matching
      ? `**${matching.competency.name}** is currently ${matching.competency.current}/100 with a required benchmark of ${matching.competency.required}/100. The gap is ${matching.gap} points. Complete a linked course, then take the competency assessment to verify improvement.`
      : 'That competency is not present in the current demo profile.';
  }
  return 'Ask me what to learn, your biggest skill gaps, why a course was recommended, or what training your team needs. I will answer from the current demo competency data.';
}

const WELCOME: Message = {
  id: '0',
  role: 'assistant',
  content: `Hello! I'm **CAPACITY AI**, your intelligent learning assistant.\n\nI can help you:\n- Understand your competency gaps\n- Recommend personalized learning paths\n- Answer questions about courses & resources\n- Provide team capability insights\n\nWhat would you like to explore today?`,
  timestamp: new Date(),
};

function formatMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-slate-900 mt-2 mb-1">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-3 text-slate-700">{renderInline(line.slice(2))}</li>;
    }
    if (line.startsWith('| ')) {
      const cells = line.split('|').filter(c => c.trim() && c.trim() !== '---');
      if (cells.length === 0) return null;
      return (
        <tr key={i} className="border-b border-slate-100">
          {cells.map((cell, j) => <td key={j} className="px-2 py-1 text-xs">{renderInline(cell.trim())}</td>)}
        </tr>
      );
    }
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="text-slate-700">{renderInline(line)}</p>;
  });
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function CapacityAI() {
  const { user } = useAuth();
  const { competenciesByUser, enrollments } = useCapacity();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageSequence = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  function sendMessage(text: string) {
    if (!user) return;
    const currentUser = user;
    messageSequence.current += 1;
    const userMsg: Message = { id: `user-${messageSequence.current}`, role: 'user', content: text, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const resp = getAIResponse(text, competenciesByUser[currentUser.id] || [], enrollments, currentUser.id);
      messageSequence.current += 1;
      setMessages(m => [...m, { id: `assistant-${messageSequence.current}`, role: 'assistant', content: resp, timestamp: new Date() }]);
      setIsTyping(false);
    }, 700);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) sendMessage(input.trim());
  }

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 animate-scale-in"
          title="CAPACITY AI"
        >
          <Zap size={22} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col animate-slide-up overflow-hidden ${isMinimized ? 'h-16' : 'h-[560px]'}`}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-900 to-blue-900 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">CAPACITY AI</p>
              <p className="text-xs text-teal-300">Personalized Learning Assistant</p>
            </div>
            <button onClick={() => setIsMinimized(v => !v)} className="text-slate-300 hover:text-white p-1">
              <ChevronDown size={16} className={`transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <Zap size={12} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-slate-50 border border-slate-100 rounded-tl-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="text-xs space-y-0.5">{formatMarkdown(msg.content)}</div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-teal-400 rounded-lg flex items-center justify-center mr-2 flex-shrink-0">
                      <Zap size={12} className="text-white" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick prompts */}
              <div className="px-4 py-2 border-t border-slate-100">
                <div className="flex gap-2 flex-wrap">
                  {QUICK_PROMPTS.map(p => (
                    <button
                      key={p.key}
                      onClick={() => sendMessage(p.label)}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors font-medium"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex gap-2 p-4 pt-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about skills, courses, gaps..."
                  className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-all flex-shrink-0"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
