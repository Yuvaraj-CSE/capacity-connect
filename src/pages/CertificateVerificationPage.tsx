import { useState } from 'react';
import { Search, ShieldCheck, XCircle } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function CertificateVerificationPage() {
  const [certificateId, setCertificateId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');
  const [certificate, setCertificate] = useState<{ certificate_id: string; status: 'Valid'; learner_name: string; course_name: string | null; issued_date: string; completion_date: string | null } | null>(null);

  async function verifyCertificate(event: React.FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setCertificate(null);
    if (!isSupabaseConfigured || !supabase || !certificateId.trim()) {
      setStatus('invalid');
      return;
    }
    const { data, error } = await supabase.rpc('verify_certificate', { lookup_certificate_id: certificateId.trim() });
    const result = data?.[0];
    if (error || !result) {
      setStatus('invalid');
      return;
    }
    setCertificate(result);
    setStatus('valid');
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9] flex items-center justify-center p-6">
      <section className="w-full max-w-xl gov-card p-8">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><ShieldCheck size={22} /></div>
          <div><h1 className="text-2xl font-black text-[#0b2545]">Certificate verification</h1><p className="text-xs text-slate-500 mt-1">Check a Capacity Connect certificate record.</p></div>
        </div>
        <form onSubmit={verifyCertificate} className="flex gap-2">
          <input value={certificateId} onChange={event => setCertificateId(event.target.value)} placeholder="Enter certificate ID" className="input flex-1" required />
          <button type="submit" className="px-4 py-2.5 bg-[#0b2545] text-white rounded-xl text-xs font-bold flex items-center gap-2"><Search size={14} /> Verify</button>
        </form>
        {status === 'loading' && <p className="text-xs text-slate-500 mt-5">Checking certificate record...</p>}
        {status === 'invalid' && <div className="mt-5 flex items-center gap-2 text-sm font-bold text-red-700"><XCircle size={18} /> Certificate not found or invalid.</div>}
        {status === 'valid' && certificate && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 space-y-2 text-sm"><p className="font-black text-emerald-800 flex items-center gap-2"><ShieldCheck size={17} /> Valid certificate</p><p><strong>Certificate ID:</strong> {certificate.certificate_id}</p><p><strong>Learner:</strong> {certificate.learner_name}</p><p><strong>Course:</strong> {certificate.course_name || 'Course record unavailable'}</p><p><strong>Issue date:</strong> {certificate.issued_date}</p>{certificate.completion_date && <p><strong>Completion date:</strong> {certificate.completion_date}</p>}</div>}
      </section>
    </main>
  );
}
