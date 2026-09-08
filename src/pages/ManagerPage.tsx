import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, FileText, Plus, Save, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase, type Database } from '../lib/supabase';

type CourseRow = Database['public']['Tables']['courses']['Row'];

type FormState = {
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  weeks: number;
  source: string;
  sourceUrl: string;
  official: boolean;
  publish: boolean;
};

const emptyForm: FormState = {
  title: '', description: '', category: 'Other', level: 'Beginner', weeks: 4,
  source: 'Capacity Connect manager-created content', sourceUrl: '', official: false, publish: false,
};

export default function ManagerPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');

  async function loadCourses() {
    if (!supabase || !user) return;
    const { data, error } = await supabase.from('courses').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setCourses(data || []);
  }

  useEffect(() => { void loadCourses(); }, [user]);

  async function createCourse() {
    if (!supabase || !user || !form.title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from('courses').insert({
      title: form.title.trim(), description: form.description.trim(), category: form.category,
      level: form.level, duration_weeks: form.weeks, source: form.source.trim() || 'Capacity Connect manager-created content',
      source_url: form.sourceUrl.trim() || null, is_official: form.official, is_published: false, content_status: 'Submitted',
      sequential_unlock: true, created_by: user.id,
    }).select('*').single();
    if (error || !data) { toast.error(error?.message || 'Could not create course.'); setSaving(false); return; }
    const weeks = Array.from({ length: form.weeks }, (_, index) => ({ course_id: String(data.id), week_number: index + 1, title: `Week ${index + 1}`, description: 'Manager-created weekly learning plan.' }));
    const { error: weekError } = await supabase.from('course_weeks').insert(weeks);
    if (weekError) toast.error(weekError.message);
    else toast.success('Course and weekly structure created.');
    setCourses(previous => [data, ...previous]);
    setSelectedCourse(String(data.id));
    setForm(emptyForm);
    setSaving(false);
  }

  async function getFirstWeek(courseId: string) {
    if (!supabase) return null;
    const { data } = await supabase.from('course_weeks').select('*').eq('course_id', courseId).order('week_number').limit(1).maybeSingle();
    return data;
  }

  async function addVideo() {
    if (!supabase || !selectedCourse || !videoTitle.trim()) return;
    const week = await getFirstWeek(selectedCourse);
    if (!week) { toast.error('Create the course weeks first.'); return; }
    const { error } = await supabase.from('course_videos').insert({ week_id: week.id, title: videoTitle.trim(), description: 'Manager-created learning video.', video_url: videoUrl.trim() || null, transcript: transcript.trim() || null, transcript_language: 'en', order_index: 1 });
    if (error) toast.error(error.message);
    else { toast.success('Video and transcript saved to Week 1.'); setVideoTitle(''); setVideoUrl(''); setTranscript(''); }
  }

  async function addQuiz() {
    if (!supabase || !selectedCourse || !quizQuestion.trim() || quizOptions.some(option => !option.trim())) return;
    const week = await getFirstWeek(selectedCourse);
    if (!week) return;
    const { data: quiz, error } = await supabase.from('quizzes').insert({ week_id: week.id, title: 'Week 1 knowledge check', passing_score: 70, allow_retake: true }).select('*').single();
    if (error || !quiz) { toast.error(error?.message || 'Could not create quiz.'); return; }
    const { error: questionError } = await supabase.from('quiz_questions').insert({ quiz_id: quiz.id, question: quizQuestion.trim(), option_a: quizOptions[0], option_b: quizOptions[1], option_c: quizOptions[2], option_d: quizOptions[3], correct_answer: correctAnswer, explanation: 'Review the Week 1 learning material and retry if needed.', order_index: 1 });
    if (questionError) toast.error(questionError.message);
    else { toast.success('Quiz question saved.'); setQuizQuestion(''); setQuizOptions(['', '', '', '']); }
  }

  async function addAssignment() {
    if (!supabase || !selectedCourse || !assignmentTitle.trim()) return;
    const week = await getFirstWeek(selectedCourse);
    if (!week) return;
    const { error } = await supabase.from('assignments').insert({ week_id: week.id, title: assignmentTitle.trim(), description: 'Manager-created weekly assignment.', instructions: assignmentInstructions.trim() });
    if (error) toast.error(error.message);
    else { toast.success('Assignment saved to Week 1.'); setAssignmentTitle(''); setAssignmentInstructions(''); }
  }

  if (!user) return null;
  if (!isSupabaseConfigured) return <div className="p-8 max-w-4xl mx-auto"><div className="gov-card p-6 text-sm text-amber-800">Supabase is not configured. Manager publishing requires the configured Supabase project and migration.</div></div>;

  return <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
      <div><span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">Manager workspace</span><h1 className="text-3xl font-black text-[#0b2545] tracking-tight mt-2">Build learning programmes</h1><p className="text-xs text-slate-500 mt-1">Create source-labelled courses, weekly material, transcripts, quizzes, and assignments.</p></div>
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><BookOpen size={16} className="text-teal-700" /> {courses.length} owned courses</div>
    </div>
    <section className="gov-card p-6 space-y-5">
      <h2 className="font-bold text-slate-900 flex items-center gap-2"><Plus size={16} /> New course</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Course title" className="input" />
        <input value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} placeholder="Category" className="input" />
        <textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Description" className="input md:col-span-2" rows={3} />
        <select value={form.level} onChange={event => setForm({ ...form, level: event.target.value as FormState['level'] })} className="input"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
        <select value={form.weeks} onChange={event => setForm({ ...form, weeks: Number(event.target.value) })} className="input"><option value={3}>3 weeks</option><option value={4}>4 weeks</option><option value={6}>6 weeks</option><option value={8}>8 weeks</option></select>
        <input value={form.source} onChange={event => setForm({ ...form, source: event.target.value })} placeholder="Source or ownership statement" className="input" />
        <input value={form.sourceUrl} onChange={event => setForm({ ...form, sourceUrl: event.target.value })} placeholder="Source URL (optional)" className="input" />
      </div>
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600"><label><input type="checkbox" checked={form.official} onChange={event => setForm({ ...form, official: event.target.checked })} /> Mark as official source-backed content</label><span className="text-amber-700">New content is submitted for admin approval before learner release.</span></div>
      <button disabled={saving || !form.title.trim()} onClick={() => void createCourse()} className="px-4 py-2.5 bg-[#0b2545] text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"><Save size={14} /> {saving ? 'Creating...' : 'Create course'}</button>
    </section>
    <section className="grid lg:grid-cols-[280px_1fr] gap-6">
      <div className="gov-card p-4 space-y-2"><h2 className="font-bold text-slate-900 text-sm mb-3">Your courses</h2>{courses.map(course => <div key={String(course.id)} className={`w-full text-left p-3 rounded-xl border ${selectedCourse === String(course.id) ? 'border-teal-400 bg-teal-50' : 'border-slate-200'}`}><button onClick={() => setSelectedCourse(String(course.id))} className="w-full text-left text-xs"><span className="font-bold block">{course.title}</span><span className="text-slate-500">{course.content_status} · {course.duration_weeks} weeks</span></button>{course.content_status === 'Rejected' && <button onClick={() => void supabase?.from('courses').update({ content_status: 'Submitted', is_published: false }).eq('id', course.id).then(({ error }) => error ? toast.error(error.message) : (setCourses(previous => previous.map(item => item.id === course.id ? { ...item, content_status: 'Submitted', is_published: false } : item)), toast.success('Course resubmitted for review.')))} className="text-[11px] font-bold text-amber-700 mt-2">Resubmit for review</button>}</div>)}{courses.length === 0 && <p className="text-xs text-slate-500">No manager courses yet.</p>}</div>
      <div className="space-y-6">
        <div className="gov-card p-6"><h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Video size={16} /> Week 1 video and transcript</h2><div className="grid gap-3"><input value={videoTitle} onChange={event => setVideoTitle(event.target.value)} placeholder="Video title" className="input" /><input value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder="Video URL or storage URL" className="input" /><textarea value={transcript} onChange={event => setTranscript(event.target.value)} placeholder="Transcript (shown under the player)" rows={5} className="input" /><button disabled={!selectedCourse} onClick={() => void addVideo()} className="action-button"><Save size={14} /> Save video</button></div></div>
        <div className="grid md:grid-cols-2 gap-6"><div className="gov-card p-6 space-y-3"><h2 className="font-bold text-slate-900 flex items-center gap-2"><CheckCircle size={16} /> Week 1 quiz</h2><input value={quizQuestion} onChange={event => setQuizQuestion(event.target.value)} placeholder="Question" className="input" />{quizOptions.map((option, index) => <div key={index} className="flex gap-2"><input value={option} onChange={event => setQuizOptions(previous => previous.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder={`Option ${index + 1}`} className="input flex-1" /><input type="radio" name="correct-answer" checked={correctAnswer === index} onChange={() => setCorrectAnswer(index)} title="Correct answer" /></div>)}<button disabled={!selectedCourse} onClick={() => void addQuiz()} className="action-button"><Save size={14} /> Save quiz</button></div><div className="gov-card p-6 space-y-3"><h2 className="font-bold text-slate-900 flex items-center gap-2"><FileText size={16} /> Week 1 assignment</h2><input value={assignmentTitle} onChange={event => setAssignmentTitle(event.target.value)} placeholder="Assignment title" className="input" /><textarea value={assignmentInstructions} onChange={event => setAssignmentInstructions(event.target.value)} placeholder="Instructions" rows={5} className="input" /><button disabled={!selectedCourse} onClick={() => void addAssignment()} className="action-button"><Save size={14} /> Save assignment</button></div></div>
      </div>
    </section>
  </div>;
}
