import { useMemo, useState } from 'react';
import { MapPin, Map as MapIcon } from 'lucide-react';
import type { Trip, ItineraryItem } from '../types/trip';

interface MapViewProps {
    items: ItineraryItem[];
    activeTrip: Trip | null;
}

export function MapView({ items, activeTrip }: MapViewProps) {
    const tripItems = useMemo(() => {
        return items.filter(i => i.trip_id === activeTrip?.id && i.location);
    }, [items, activeTrip?.id]);

    const days = useMemo(() => {
        const uniqueDays = Array.from(new Set(tripItems.map(i => i.dayId)));
        return uniqueDays.sort((a, b) => {
            const [m1, d1] = a.split('/').map(Number);
            const [m2, d2] = b.split('/').map(Number);
            if (m1 !== m2) return m1 - m2;
            return d1 - d2;
        });
    }, [tripItems]);

    const [selectedDayId, setSelectedDayId] = useState<string | 'all'>('all');

    const filteredItems = useMemo(() => {
        if (selectedDayId === 'all') return tripItems;
        return tripItems.filter(i => i.dayId === selectedDayId);
    }, [tripItems, selectedDayId]);

    // Construct search query for Google Maps
    // For "all" we search for the current trip name or its primary locations
    // For specific day we search for the top locations of that day
    const mapUrl = useMemo(() => {
        const locations = filteredItems.map(i => i.location).filter(Boolean);
        if (locations.length === 0) {
            return `https://www.google.com/maps?q=${encodeURIComponent(activeTrip?.name || 'Travel')}&output=embed`;
        }

        // Search for the specific destination/POI. If multiple, we search for the first one primarily
        // but for a trip overview, we might search for the trip name + location
        const query = encodeURIComponent(locations.join(' + '));
        return `https://www.google.com/maps?q=${query}&output=embed`;
    }, [filteredItems, activeTrip?.name]);

    return (
        <div className="h-[calc(100vh-160px)] flex flex-col bg-slate-50 animate-in fade-in duration-500">
            {/* Header / Selector */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 shadow-sm z-30">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <MapIcon size={20} className="text-blue-600" />
                            行程地圖
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {activeTrip?.name}
                        </p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setSelectedDayId('all')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${selectedDayId === 'all'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            全體
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {days.map((dayId) => (
                        <button
                            key={dayId}
                            onClick={() => setSelectedDayId(dayId)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl border text-[10px] font-black transition-all ${selectedDayId === dayId
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                                }`}
                        >
                            {dayId}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative overflow-hidden bg-slate-200">
                {filteredItems.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                            <MapPin size={32} className="opacity-20" />
                        </div>
                        <h3 className="font-bold text-slate-600">無地點資料</h3>
                        <p className="text-xs mt-2">此日期的行程尚未設定明確的地點名稱</p>
                    </div>
                ) : (
                    <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="grayscale-[20%] contrast-[110%]"
                    />
                )}
            </div>

            {/* Quick Location Preview */}
            {filteredItems.length > 0 && (
                <div className="h-24 bg-white border-t border-slate-100 px-6 flex items-center gap-4 overflow-x-auto no-scrollbar">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex-shrink-0 flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[200px]"
                        >
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">
                                {item.time?.split(':')[0]}
                            </div>
                            <div className="truncate">
                                <h4 className="text-[10px] font-black text-slate-900 truncate">{item.title}</h4>
                                <p className="text-[9px] text-slate-400 font-bold truncate">{item.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
