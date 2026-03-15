import { type ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { supabase } from '../lib/supabase';
import { LogOut, User as UserIcon, Globe } from 'lucide-react';
import { type User } from '@supabase/supabase-js';

interface LayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (id: string) => void;
    onSwitchTrip?: () => void;
    user?: User;
}

export function Layout({ children, activeTab, onTabChange, onSwitchTrip, user }: LayoutProps) {
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Logout error:', error);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <span className="text-[10px] font-black">PY</span>
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                            PYTravel
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end mr-1">
                            <span className="text-[10px] font-black text-slate-400 leading-none uppercase tracking-tighter">Authorized</span>
                            <span className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.email}</span>
                        </div>
                        <div className="w-9 h-9 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 group relative cursor-pointer hover:bg-slate-50 transition-all">
                            <UserIcon size={18} />
                            <div className="absolute top-11 right-0 bg-white border border-slate-100 rounded-2xl p-2 shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto min-w-[140px]">
                                {onSwitchTrip && (
                                    <button
                                        onClick={onSwitchTrip}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all whitespace-nowrap mb-1"
                                    >
                                        <Globe size={14} /> 切換旅程
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all whitespace-nowrap"
                                >
                                    <LogOut size={14} /> 登出系統
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
                {children}
            </main>

            <MobileNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
    );
}
