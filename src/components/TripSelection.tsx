import { Globe, Calendar, ChevronRight, Plus } from 'lucide-react';
import type { Trip } from '../types/trip';

interface TripSelectionProps {
    trips: Trip[];
    onSelect: (trip: Trip) => void;
    onNewTrip?: () => void;
}

export function TripSelection({ trips, onSelect, onNewTrip }: TripSelectionProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-6 pb-12">
            <header className="mb-12 mt-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-6">
                    <Globe size={32} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">選擇您的旅程</h1>
                <p className="text-slate-500 font-medium font-inter">歡迎回來！今天想規劃哪一趟冒險？</p>
            </header>

            <div className="flex-1 max-w-lg mx-auto w-full space-y-4">
                <div className="grid gap-4">
                    {trips.map((trip) => (
                        <button
                            key={trip.id}
                            onClick={() => onSelect(trip)}
                            className="group relative bg-white border border-slate-100 p-6 rounded-[32px] text-left transition-all hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1 active:scale-95 overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${trip.theme_color === 'blue' ? 'bg-blue-600' : 'bg-indigo-600'}`} />

                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${trip.theme_color === 'blue' ? 'bg-blue-500' : 'bg-indigo-500'}`} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Trip Plan</span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">{trip.name}</h3>
                                    <div className="flex items-center gap-4 pt-1">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                            <Calendar size={13} className="text-slate-400" />
                                            <span>{trip.start_date.split('-')[1]}/{trip.start_date.split('-')[2]} - {trip.end_date.split('-')[1]}/{trip.end_date.split('-')[2]}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </button>
                    ))}

                    <button
                        onClick={onNewTrip}
                        className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-white transition-all active:scale-95 group"
                    >
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                            <Plus size={24} />
                        </div>
                        <span className="text-sm font-black tracking-tight">建立新旅程</span>
                    </button>
                </div>
            </div>

            <footer className="mt-12 text-center">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">PYTravel • Premium Travel Planner</p>
            </footer>
        </div>
    );
}
