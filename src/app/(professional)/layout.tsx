'use client';

import { Calendar, Users, Activity, Settings, Dumbbell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState('Profesional');
  const [userInitials, setUserInitials] = useState('PR');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || user.user_metadata?.role !== 'professional') {
          setIsAuthorized(false);
          router.push('/login');
          return;
        }

        setIsAuthorized(true);
        const fullName = user.user_metadata.full_name || 'Kinesiólogo';
        setUserName(fullName);
        const splitName = fullName.split(' ');
        if (splitName.length > 1) {
          setUserInitials(splitName[0][0].toUpperCase() + splitName[1][0].toUpperCase());
        } else {
          setUserInitials(fullName.substring(0, 2).toUpperCase());
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isAuthorized === null) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-emerald-500 font-bold flex-col gap-4">
    <Activity className="animate-spin" size={40} />
    <p className="tracking-widest uppercase text-xs">Iniciando Sistema...</p>
  </div>;
  
  if (isAuthorized === false) return null;

  const navItems = [
    { href: '/pro-dashboard', icon: <Calendar size={20} />, label: 'Dashboard' },
    { href: '/patients', icon: <Users size={20} />, label: 'Pacientes' },
    { href: '/exercises', icon: <Dumbbell size={20} />, label: 'Catálogo' },
    { href: '/settings', icon: <Settings size={20} />, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar Kalos Pro */}
      <aside className="w-72 bg-[#0a0a0a] flex flex-col fixed h-screen z-20 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 overflow-hidden border border-white/5">
              <Image src="/logo-kalos.jpg" alt="Logo" width={48} height={48} className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-white leading-none">KALOS</span>
              <span className="text-emerald-500 font-bold text-[10px] tracking-[0.3em] uppercase leading-none mt-1">SISTEMAS</span>
            </div>
          </div>
          
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/pro-dashboard' && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                      : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Perfil Pro abajo */}
        <div className="mt-auto p-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-[1.5rem] mb-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-black text-sm">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white truncate">{userName}</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">Kinesiólogo</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-red-400 font-bold text-xs transition-colors"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 ml-72 p-10 min-h-screen">
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}
