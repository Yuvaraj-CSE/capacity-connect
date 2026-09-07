import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { knowledgeResources } from '../data/mockData';
import type { KnowledgeResource } from '../types';
import { Badge } from '../components/ui/SharedComponents';
import {
  Search, BookOpen, Bookmark, Share2,
  Eye, Calendar, Tag, Plus, X, Download, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Policy', 'HR Policy', 'Compliance', 'Operations', 'Security', 'Learning'];
const TYPES = ['all', 'sop', 'guide', 'policy', 'document'];

export default function KnowledgeHubPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('all');
  const [activeDoc, setActiveDoc] = useState<KnowledgeResource | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(['kr1', 'kr3']));
  const [showAddModal, setShowAddModal] = useState(false);
  const [customResources, setCustomResources] = useState<KnowledgeResource[]>(knowledgeResources);

  // Form state for creating a new resource
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Policy');
  const [newType, setNewType] = useState<KnowledgeResource['type']>('guide');
  const [newDesc, setNewDesc] = useState('');
  const [newContent, setNewContent] = useState('');

  if (!user) return null;

  const filtered = customResources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === 'All' || r.category.toLowerCase().includes(category.toLowerCase());
    const matchType = selectedType === 'all' || r.type === selectedType;
    return matchSearch && matchCat && matchType;
  });

  function toggleBookmark(id: string, e?: React.MouseEvent) {
    e?.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast('Removed from bookmarks');
      } else {
        next.add(id);
        toast.success('Saved to bookmarks!');
      }
      return next;
    });
  }

  function handleCreateResource(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const resource: KnowledgeResource = {
      id: `kr-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      type: newType,
      description: newDesc || newContent.slice(0, 90) + '...',
      tags: [newCategory.toLowerCase(), newType, 'internal'],
      views: 1,
      updatedAt: new Date().toISOString().slice(0, 10),
      content: newContent,
    };

    setCustomResources(prev => [resource, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewContent('');
    toast.success('Knowledge resource published to the hub!');
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff9933] bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
              National Institutional Knowledge Repository
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0b2545] tracking-tight">
            Knowledge Hub & Standard Operating Procedures
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Centralized operational policies, civil service guidelines, SOPs, and compliance frameworks
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user.role === 'admin' || user.role === 'manager') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#0b2545] text-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#13315c] transition-colors shadow-xs"
            >
              <Plus size={15} /> Publish Guideline
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-8 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search policies, SOPs, frameworks, compliance guides..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Category:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Types */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Format:</span>
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                selectedType === t
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Resources */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(res => {
          const isBookmarked = bookmarkedIds.has(res.id);
          return (
            <div
              key={res.id}
              onClick={() => setActiveDoc(res)}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between cursor-pointer group card-hover"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {res.type}
                    </span>
                    <Badge label={res.category} color="teal" />
                  </div>
                  <button
                    onClick={(e) => toggleBookmark(res.id, e)}
                    className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                      isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-slate-500'
                    }`}
                  >
                    <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors mb-2">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
                  {res.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {res.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[11px] font-medium bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100 flex items-center gap-1">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} /> {res.updatedAt}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye size={12} /> {res.views} reads
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
            <BookOpen size={44} className="mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="font-bold text-slate-700 text-base">No resources match your filters</p>
            <p className="text-sm mt-1 text-slate-400">Try changing keywords or resetting the category filter</p>
          </div>
        )}
      </div>

      {/* Document Reader Modal */}
      {activeDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setActiveDoc(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {activeDoc.type}
                </span>
                <span className="text-xs text-slate-400">Category: {activeDoc.category}</span>
              </div>
              <h2 className="text-2xl font-black text-white">{activeDoc.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span>Updated: {activeDoc.updatedAt}</span>
                <span>•</span>
                <span>{activeDoc.views + 1} views</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Official Organization Standard</h4>
                  <p className="text-xs text-blue-700 mt-0.5">This document defines standard compliance and procedural rules applicable across all active departments.</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Document Summary</h4>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{activeDoc.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Full Procedure & Guidance Content</h4>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-line font-mono text-xs">
                  {activeDoc.content}
                </div>
              </div>

              {/* Tags */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Associated Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {activeDoc.tags.map(t => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => toggleBookmark(activeDoc.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-200/60 transition-colors"
              >
                <Bookmark size={15} fill={bookmarkedIds.has(activeDoc.id) ? 'currentColor' : 'none'} className={bookmarkedIds.has(activeDoc.id) ? 'text-amber-500' : ''} />
                {bookmarkedIds.has(activeDoc.id) ? 'Bookmarked' : 'Save for later'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success('Document downloaded as PDF')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <Download size={14} /> PDF
                </button>
                <button
                  onClick={() => toast.success('Link copied to clipboard!')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold">Publish Knowledge Resource</h2>
              <p className="text-xs text-slate-400 mt-0.5">Add an official guideline, procedure, or SOP to the repository</p>
            </div>

            <form onSubmit={handleCreateResource} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Incident Escalation Protocol"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Document Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sop">SOP (Standard Procedure)</option>
                    <option value="policy">Policy</option>
                    <option value="guide">Guide</option>
                    <option value="document">General Document</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Brief Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Summary of what this document prescribes"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Full Content & Steps</label>
                <textarea
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  rows={6}
                  placeholder="Enter detailed instructions, numbered steps, or policy text..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
