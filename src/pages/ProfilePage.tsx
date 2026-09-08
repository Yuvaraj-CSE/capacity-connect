import { useAuth } from '../context/AuthContext';
import { Avatar, StateEmblem } from '../components/ui/SharedComponents';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
        <StateEmblem className="w-9 h-11" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#c69214]">Capacity Connect identity</p>
          <h1 className="text-2xl font-black text-[#0b2545] mt-1">Profile</h1>
        </div>
      </div>
      <section className="gov-card p-6 flex items-center gap-4">
        <Avatar initials={user.avatar} size="lg" />
        <div>
          <h2 className="text-lg font-black text-slate-900">{user.name}</h2>
          <p className="text-xs text-slate-500 mt-1">{user.position} • {user.department}</p>
          <p className="text-xs text-slate-400 mt-1">{user.email}</p>
        </div>
      </section>
    </div>
  );
}
