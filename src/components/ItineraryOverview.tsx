import { useMemo } from 'react';
import { MapPin, Car } from 'lucide-react';
import type { Trip, ItineraryItem } from '../types/trip';

interface ItineraryOverviewProps {
    items: ItineraryItem[];
    activeTrip: Trip | null;
}

export function ItineraryOverview({ items, activeTrip }: ItineraryOverviewProps) {
    const tripItems = useMemo(() => {
        return items.filter(i => i.trip_id === (activeTrip?.id || 'europe-2026'));
    }, [items, activeTrip?.id]);

    const getPhaseInfo = (dayId: string) => {
        const [m, d] = dayId.split('/').map(Number);
        if (activeTrip?.id === 'phuket-2026') {
            if (m === 10 && d <= 19) return { id: 'p1', title: '聽課任務與安頓', color: 'blue', label: 'Phase 1' };
            if (m === 10 && d <= 21) return { id: 'p2', title: '文青與大型水族館', color: 'indigo', label: 'Phase 2' };
            if (m === 10 && d <= 24) return { id: 'p3', title: '隨性放鬆與購物', color: 'violet', label: 'Phase 3' };
        } else {
            if (m === 8 || (m === 9 && d <= 4)) return { id: 'p1', title: '匈牙利佩斯區', color: 'blue', label: 'Phase 1' };
            if (m === 9 && d <= 7) return { id: 'p2', title: '巴拉頓湖度假', color: 'indigo', label: 'Phase 2' };
            if (m === 9 && d <= 12) return { id: 'p3', title: '維也納經典', color: 'violet', label: 'Phase 3' };
        }
        return null;
    };

    const groupedItemsByPhase = useMemo(() => {
        const groups: Record<string, ItineraryItem[]> = {};
        tripItems.forEach(item => {
            if (!groups[item.dayId]) groups[item.dayId] = [];
            groups[item.dayId].push(item);
        });

        const sortedDays = Object.entries(groups).sort((a, b) => {
            const [m1, d1] = a[0].split('/').map(Number);
            const [m2, d2] = b[0].split('/').map(Number);
            if (m1 !== m2) return m1 - m2;
            return d1 - d2;
        });

        const phaseGroups: { phase: any, days: [string, ItineraryItem[]][] }[] = [];
        let currentPhaseId = '';

        sortedDays.forEach(([dayId, items]) => {
            const phase = getPhaseInfo(dayId);
            if (phase && phase.id !== currentPhaseId) {
                phaseGroups.push({ phase, days: [[dayId, items]] });
                currentPhaseId = phase.id;
            } else if (phaseGroups.length > 0) {
                phaseGroups[phaseGroups.length - 1].days.push([dayId, items]);
            } else {
                // Fallback for no phase
                phaseGroups.push({ phase: { title: '未分類階段', color: 'slate', label: 'N/A' }, days: [[dayId, items]] });
            }
        });

        return phaseGroups;
    }, [tripItems, activeTrip?.id]);

    return (
        <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="px-6 pt-8 pb-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">行程總覽</h2>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20">
                        {activeTrip?.name}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                        {tripItems.length} 個項目 • {groupedItemsByPhase.reduce((acc, p) => acc + p.days.length, 0)} 天行程
                    </span>
                </div>
            </div>

            {/* Timeline Content */}
            <div className="px-6 space-y-12 mt-8">
                {groupedItemsByPhase.map(({ phase, days }, phaseIdx) => (
                    <div key={phase.id || phaseIdx} className="space-y-8">
                        {/* Phase Header */}
                        <div className="relative">
                            <div className={`inline-flex flex-col mb-2`}>
                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-50`}>
                                    {phase.label}
                                </span>
                                <h3 className={`text-2xl font-black tracking-tight text-slate-900 border-l-4 border-${phase.color}-500 pl-4`}>
                                    {phase.title}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-10 pl-2">
                            {days.map(([dayId, dayItems], dayIdx) => (
                                <div key={dayId} className="relative">
                                    {/* Day Header */}
                                    <div className="sticky top-4 z-30 mb-6 group">
                                        <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-4 rounded-[28px] shadow-xl shadow-slate-200/50 flex items-center justify-between group-hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center font-black`}>
                                                    <span className="text-[10px] opacity-60 uppercase tracking-tighter">{dayId.split('/')[0]}月</span>
                                                    <span className="text-lg leading-none">{dayId.split('/')[1]}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-900">DAY {days.indexOf([dayId, dayItems]) !== -1 ? days.findIndex(d => d[0] === dayId) + 1 : phaseIdx * 3 + dayIdx + 1}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dayId}</p>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100/50">
                                                {dayItems.length} 行程
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items for this day */}
                                    <div className="pl-6 space-y-0 relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-100 ml-[-1px]" />

                                        {dayItems.map((item) => (
                                            <div key={item.id} className="relative pl-8 pb-8 group/item">
                                                <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 bg-white border-2 border-slate-300 rounded-full group-hover/item:border-blue-500 group-hover/item:scale-125 transition-all z-10" />

                                                <div className="flex items-start gap-4">
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 group-hover/item:text-blue-600 group-hover/item:bg-blue-50 transition-colors whitespace-nowrap mt-0.5 min-w-[65px] text-center">
                                                        {item.time}
                                                    </span>
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-black text-slate-800 group-hover/item:text-blue-600 transition-colors leading-tight">
                                                            {item.title}
                                                        </h4>
                                                        {item.location && (
                                                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-1">
                                                                <MapPin size={10} className="shrink-0" />
                                                                <span className="truncate">{item.location}</span>
                                                            </div>
                                                        )}
                                                        {item.description && !item.description.includes('🍽️') && (
                                                            <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        {item.transport && (
                                                            <div className="inline-flex items-center gap-1.5 text-[9px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full mt-2 border border-indigo-100/50">
                                                                <Car size={9} />
                                                                {item.transport}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer space */}
            <div className="h-20" />
        </div>
    );
}
