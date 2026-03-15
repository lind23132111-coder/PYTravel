import React from 'react';
import { Plane, Receipt, Map as MapIcon, Settings, LayoutDashboard } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    onClick: () => void;
}

function NavItem({ icon: Icon, label, isActive, onClick }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
        >
            <Icon size={24} weight={isActive ? "fill" : "regular"} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
            {isActive && <div className="absolute bottom-0 w-8 h-1 bg-blue-600 rounded-t-full" />}
        </button>
    );
}

interface MobileNavProps {
    activeTab: string;
    onTabChange: (id: string) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
    const tabs = [
        { id: 'overview', label: '總覽', icon: LayoutDashboard },
        { id: 'itinerary', label: '行程', icon: Plane },
        { id: 'expenses', label: '帳單', icon: Receipt },
        { id: 'map', label: '地圖', icon: MapIcon },
        { id: 'settings', label: '設定', icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 pb-safe flex items-center justify-around z-40">
            {tabs.map((tab) => (
                <NavItem
                    key={tab.id}
                    icon={tab.icon}
                    label={tab.label}
                    isActive={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                />
            ))}
        </nav>
    );
}
