import { useState, useMemo, useCallback, useEffect } from 'react';
import { MapPin, MoreVertical, Plus, ChevronRight, Timer, Car, Trash2, Calendar, Globe, Database, Maximize2, Minimize2 } from 'lucide-react';
import { openGoogleMaps } from '../lib/maps';
import { ItineraryForm } from './ItineraryForm';
import { BulkEditModal } from './BulkEditModal';
import type { Trip, ItineraryItem } from '../types/trip';

interface ItineraryItemProps extends ItineraryItem {
    onEdit?: (item: ItineraryItem) => void;
    onDelete?: () => void;
    // New drag props
    index: number;
    moveItem: (dragIndex: number, hoverIndex: number) => void;
    onDragEnd: () => void;
}

interface ItineraryViewProps {
    activeTrip: Trip | null;
    onTripChange: (trip: Trip | null) => void;
    items: ItineraryItem[];
    onItemsChange: (items: ItineraryItem[]) => void;
}

function ItineraryItemCard(props: ItineraryItemProps) {
    const {
        time, title, location, locationPlaceId, description, duration, transport, isBranch, participants,
        onEdit, onDelete, index, moveItem, onDragEnd
    } = props;
    const [showMenu, setShowMenu] = useState(false);

    // Inline editing states
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [editTimeStr, setEditTimeStr] = useState(time);

    // Drag & Drop
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
        // Use a slight delay to allow the drag image to be captured before we hide/fade the original
        setTimeout(() => setIsDragging(true), 0);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow drop
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (draggedIndex !== index && !isNaN(draggedIndex)) {
            moveItem(draggedIndex, index);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        onDragEnd();
    };

    return (
        <div
            className={`relative pl - 10 pb - 6 group / item ${isBranch ? 'opacity-85' : ''} ${showMenu ? 'z-[100]' : 'z-10'} ${isDragging ? 'opacity-30' : 'opacity-100'} transition - opacity`}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
        >
            {/* Drag Handle Area */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <MoreVertical size={16} />
            </div>

            {/* Timeline line */}
            <div className={`absolute left - 14 top - 0 bottom - 0 w - 0.5 ${isBranch ? 'border-l-2 border-dashed border-indigo-200 bg-transparent' : 'bg-slate-200'} group - last / item: bg - transparent group - last / item: border - transparent`} />

            {/* Timeline dot */}
            <div className={`absolute left - 11 top - [22px] w - 6 h - 6 bg - white border - [3px] rounded - full flex items - center justify - center z - 10 shadow - sm group - hover / item: scale - 110 group - hover / item: border - blue - 500 transition - all cursor - grab active: cursor - grabbing ${isBranch ? 'border-indigo-400' : 'border-blue-400'} `}>
            </div>

            {/* Transportation Indicator */}
            {transport && (
                <div className={`absolute left - [-4px] top - [-36px] flex items - center gap - 2 px - 3 py - 1 border rounded - full shadow - sm z - 20 transition - colors ${isBranch ? 'bg-indigo-50 border-indigo-100 group-hover/item:border-indigo-200' : 'bg-slate-50 border-slate-100 group-hover/item:border-blue-100'} `}>
                    <Car size={10} className={`text - slate - 400 ${isBranch ? 'group-hover/item:text-indigo-400' : 'group-hover/item:text-blue-400'} `} />
                    <span className={`text - [9px] font - bold uppercase tracking - tighter transition - colors ${isBranch ? 'text-indigo-600 group-hover/item:text-indigo-700' : 'text-slate-500 group-hover/item:text-blue-600'} `}>{transport}</span>
                </div>
            )}

            <div className={`p - 5 rounded - [24px] border transition - all group relative ${showMenu ? 'z-50 ring-4 ring-blue-500/5' : 'z-20'} ${isBranch ? 'bg-indigo-50/30 border-indigo-100 border-dashed hover:bg-indigo-50/50 hover:border-indigo-200 shadow-sm hover:shadow-indigo-900/5' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-0.5'} `}>

                {isBranch && (
                    <div className="absolute top-[-10px] right-6 px-2.5 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-600/20 z-30">
                        🌿 支線行程
                    </div>
                )}

                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            {isEditingTime ? (
                                <input
                                    type="time"
                                    className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-200 rounded px-1 min-w-[70px] outline-none"
                                    value={editTimeStr.replace(/ AM| PM/, '')}
                                    autoFocus
                                    onBlur={() => setIsEditingTime(false)}
                                    onChange={(e) => {
                                        // Just a placeholder for actual save logic handled higher up ideally
                                        setEditTimeStr(e.target.value);
                                    }}
                                />
                            ) : (
                                <button onClick={() => setIsEditingTime(true)} className="text-sm font-black text-slate-800 hover:text-blue-600 transition-colors text-left">
                                    {time.replace(/ AM| PM/, '')}
                                    <span className="text-[10px] text-slate-400 ml-1">{time.includes('PM') ? 'PM' : 'AM'}</span>
                                </button>
                            )}
                        </div>
                        {duration && (
                            <div className={`flex items - center gap - 1.5 text - [10px] font - bold px - 2.5 py - 1 rounded - full border ${isBranch ? 'bg-indigo-100/30 text-indigo-500 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100/50'} `}>
                                <Timer size={10} />
                                <span>{isBranch ? duration : `停留 ${duration} `}</span>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className={`p - 1.5 transition - colors rounded - xl active: scale - 95 ${showMenu ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'} `}
                        >
                            <MoreVertical size={16} />
                        </button>

                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-10 w-44 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                                    <button onClick={() => { onEdit?.(props); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors">
                                        <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">✍️</div>
                                        編輯項目
                                    </button>
                                    <div className="h-[1px] bg-slate-100 mx-2 my-1.5" />
                                    <button onClick={() => { onDelete?.(); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
                                        <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                            <Trash2 size={12} />
                                        </div>
                                        刪除此項目
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    {location && (
                        <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                            {/* Placeholder for actual image from Google Places if available */}
                            <img src={`https://source.unsplash.com/random/100x100?${encodeURIComponent(location.split(' ')[0])}`} alt="" className="w-full h-full object-cover opacity-80" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        </div >
                    )}
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <h3 className="font-bold text-slate-900 leading-snug mb-1">{title}</h3>
                        </div>

                        {location && (
                            <button
                                onClick={() => openGoogleMaps(location, locationPlaceId)}
                                className="text-xs text-slate-500 font-medium hover:text-blue-600 transition-colors flex items-center gap-1 text-left"
                            >
                                <span className="line-clamp-1">{location}</span>
                            </button>
                        )}
                    </div>
                </div >

                {description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 mt-2">{description}</p>
                )}

                {
                    participants && participants.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Team:</span>
                            {participants.map((person, idx) => (
                                <span key={idx} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${isBranch ? 'bg-indigo-100/50 border-indigo-200 text-indigo-600' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                    {person}
                                </span>
                            ))}
                        </div>
                    )
                }
            </div >
        </div >
    );
}

const calculateBaseTime = (prevItem?: ItineraryItem): string => {
    if (!prevItem) return "09:00 AM";
    try {
        const [timeStr, modifier] = prevItem.time.split(' ');
        const [hoursRaw, minutes] = timeStr.split(':').map(Number);
        let hours = hoursRaw;
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        let totalMinutes = hours * 60 + minutes;
        const stayMatch = prevItem.duration?.match(/(\d+(\.\d+)?)\s*(小時|分鐘)/);
        if (stayMatch) {
            const val = parseFloat(stayMatch[1]);
            const unit = stayMatch[3];
            totalMinutes += unit === '小時' ? val * 60 : val;
        } else if (prevItem.duration?.includes('入住')) {
            totalMinutes += 60;
        }
        const nextHours = Math.floor(totalMinutes / 60) % 24;
        const nextMinutes = totalMinutes % 60;
        const nextModifier = nextHours >= 12 ? 'PM' : 'AM';
        const displayHours = nextHours % 12 || 12;
        return `${displayHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')} ${nextModifier}`;
    } catch {
        return prevItem.time;
    }
};

export function ItineraryView({ activeTrip, onTripChange, items, onItemsChange }: ItineraryViewProps) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
    const [insertIndex, setInsertIndex] = useState<number | null>(null);
    const [selectedDayId, setSelectedDayId] = useState('');
    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    const activeItems = useMemo(() => {
        return items.filter(i => i.dayId === selectedDayId && i.trip_id === (activeTrip?.id || 'europe-2026'));
    }, [items, selectedDayId, activeTrip?.id]);

    const handleSave = (newItemData: ItineraryItem) => {
        const newItem = { ...newItemData, dayId: selectedDayId, trip_id: activeTrip?.id || 'europe-2026' };
        if (editingItem) {
            onItemsChange(items.map(item => item.id === newItem.id ? newItem : item));
        } else if (insertIndex !== null) {
            const currentDayItems = items.filter(i => i.dayId === selectedDayId);
            const targetItem = currentDayItems[insertIndex];
            const globalIndex = items.indexOf(targetItem);
            const newItems = [...items];
            newItems.splice(globalIndex === -1 ? items.length : globalIndex, 0, newItem);
            onItemsChange(newItems);
        } else {
            onItemsChange([...items, newItem]);
        }
        setEditingItem(null);
        setShowForm(false);
        setInsertIndex(null);
    };

    const handleDragDropReorder = useCallback((dragIndex: number, hoverIndex: number) => {
        const currentDayItems = items.filter(i => i.dayId === selectedDayId);

        // Find global indices
        const dragGlobalIndex = items.findIndex(i => i.id === currentDayItems[dragIndex].id);
        const hoverGlobalIndex = items.findIndex(i => i.id === currentDayItems[hoverIndex].id);

        if (dragGlobalIndex === -1 || hoverGlobalIndex === -1) return;

        const newItems = [...items];
        const draggedItem = newItems.splice(dragGlobalIndex, 1)[0];

        // Since we removed one, the hover global index might shift if it was greater
        const adjustedHoverGlobalIndex = dragGlobalIndex < hoverGlobalIndex ? hoverGlobalIndex - 1 : hoverGlobalIndex;

        newItems.splice(adjustedHoverGlobalIndex, 0, draggedItem);
        onItemsChange(newItems);
    }, [items, selectedDayId, onItemsChange]);

    const handleDragEnd = useCallback(() => {
        // Optional: save to backend here if needed
    }, []);

    const deleteItem = (id: string) => { onItemsChange(items.filter(item => item.id !== id)); };

    const openInsertForm = (index: number) => {
        setInsertIndex(index);
        setEditingItem(null);
        setShowForm(true);
    };

    const tripDays = useMemo(() => {
        if (activeTrip?.id === 'phuket-2026') {
            return [
                { id: "10/17", date: '10月 17', day: '17' },
                { id: "10/18", date: '10月 18', day: '18' },
                { id: "10/19", date: '10月 19', day: '19' },
                { id: "10/20", date: '10月 20', day: '20' },
                { id: "10/21", date: '10月 21', day: '21' },
                { id: "10/22", date: '10月 22', day: '22' },
                { id: "10/23", date: '10月 23', day: '23' },
                { id: "10/24", date: '10月 24', day: '24' },
            ];
        }
        return [
            { id: "8/30", date: '8月 30', day: '30' }, { id: "8/31", date: '8月 31', day: '31' },
            { id: "9/01", date: '9月 01', day: '01' }, { id: "9/02", date: '9月 02', day: '02' },
            { id: "9/03", date: '9月 03', day: '03' }, { id: "9/04", date: '9月 04', day: '04' },
            { id: "9/05", date: '9月 05', day: '05' }, { id: "9/06", date: '9月 06', day: '06' },
            { id: "9/07", date: '9月 07', day: '07' }, { id: "9/08", date: '9月 08', day: '08' },
            { id: "9/09", date: '9月 09', day: '09' }, { id: "9/10", date: '9月 10', day: '10' },
            { id: "9/11", date: '9月 11', day: '11' }, { id: "9/12", date: '9月 12', day: '12' },
        ];
    }, [activeTrip?.id]);

    // Initial date selection
    useEffect(() => {
        if (!selectedDayId && tripDays.length > 0) {
            setSelectedDayId(tripDays[0].id);
        }
    }, [tripDays, selectedDayId]);

    const phases = useMemo(() => {
        if (activeTrip?.id === 'phuket-2026') {
            return {
                "10/17": "🌴 第一階段：抵達與安頓",
                "10/20": "🏘️ 第二階段：南移與古鎮散步",
                "10/24": "✈️ 第三階段：悠閒賦歸",
            } as Record<string, string>;
        }
        return {
            "8/30": "🥂 第一階段：直奔布達佩斯",
            "9/05": "⛵ 第二階段：巴拉頓湖區",
            "9/08": "🇦🇹 第三階段：維也納",
        } as Record<string, string>;
    }, [activeTrip?.id]);

    const activePhaseTitle = phases[selectedDayId];
    const prevItemForTime = insertIndex !== null ? activeItems[insertIndex - 1] : activeItems[activeItems.length - 1];
    const baseTime = calculateBaseTime(prevItemForTime);
    const mockTrips: Trip[] = [
        { id: 'europe-2026', name: '中歐・德奧匈浪漫巡禮', owner_id: 'user1', start_date: '2026-08-30', end_date: '2026-09-12', theme_color: 'blue', created_at: new Date().toISOString() },
        { id: 'phuket-2026', name: '普吉島・海島奢華度假', owner_id: 'user1', start_date: '2026-10-17', end_date: '2026-10-24', theme_color: 'indigo', created_at: new Date().toISOString() }
    ];

    const mapUrl = useMemo(() => {
        const locations = activeItems.map(i => i.location).filter(Boolean);
        if (locations.length === 0) {
            return `https://www.google.com/maps?q=${encodeURIComponent(activeTrip?.name || 'Travel')}&output=embed`;
        }
        const query = encodeURIComponent(locations.join(' + '));
        return `https://www.google.com/maps?q=${query}&output=embed`;
    }, [activeItems, activeTrip?.name]);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-slate-50 relative -mx-4 -mt-4">

            {/* Top Section: Map Layer */}
            <div className={`flex-shrink-0 ${isMapExpanded ? 'h-[75vh]' : 'h-[40vh]'} w-[100vw] relative bg-slate-200 transition-all duration-300 ease-in-out z-0`}>
                {activeItems.length === 0 || !activeItems.some(i => i.location) ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-10 text-center bg-slate-100">
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
                        className="grayscale-[10%] contrast-[105%]"
                    />
                )}

                {/* Header Actions Overlay on Map */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
                    <div className="relative group pointer-events-auto">
                        <button className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-100/50 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all active:scale-95">
                            <h2 className="text-sm font-black text-slate-800 tracking-tight">{activeTrip?.name || '選擇旅程'}</h2>
                            <ChevronRight size={14} className="text-slate-400 group-hover:rotate-90 transition-transform" />
                        </button>
                        <div className="absolute top-12 left-0 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0 text-left">
                            <div className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">我的旅程</div>
                            {mockTrips.map(trip => (
                                <button key={trip.id} onClick={() => onTripChange(trip)} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeTrip?.id === trip.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}>
                                    <div className={`w-2 h-2 rounded-full ${trip.theme_color === 'blue' ? 'bg-blue-500' : 'bg-indigo-500'}`} />
                                    <span className="text-xs font-bold text-left truncate">{trip.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button onClick={() => setShowBulkEdit(true)} className="p-2.5 bg-white/95 backdrop-blur-md border border-slate-100/50 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-white shadow-lg transition-all"><Database size={18} /></button>
                        <button onClick={() => { setEditingItem(null); setInsertIndex(null); setShowForm(true); }} className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:bg-black"><Plus size={20} /></button>
                    </div>
                </div>

                {/* Map Expand Toggle placed at bottom right of the map area */}
                <div className="absolute bottom-6 right-4 z-10">
                    <button
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        className="p-2.5 bg-white/95 backdrop-blur-md border border-slate-100/50 rounded-full text-slate-700 hover:text-blue-600 shadow-xl transition-all active:scale-95 flex items-center justify-center"
                    >
                        {isMapExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>
            </div>

            {/* Timeline Bottom Sheet Area */}
            <div className="flex-1 flex flex-col bg-slate-50 relative mt-[-20px] rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden z-10">
                {/* Drag Handle to indicate scrollability */}
                <div className="w-full flex justify-center pt-3 pb-1 bg-white/50 backdrop-blur-sm z-20">
                    <div className="w-8 h-1.5 rounded-full bg-slate-200" />
                </div>

                {/* Horizontal Day Selector */}
                <div className="px-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex overflow-x-auto no-scrollbar items-end">
                        <button
                            onClick={() => setSelectedDayId('all')}
                            className={`flex flex-col items-center justify-center min-w-[64px] pb-3 pt-2 relative transition-all ${selectedDayId === 'all' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="text-sm font-black tracking-tight mb-0.5">總覽</span>
                            {selectedDayId === 'all' && <div className="absolute bottom-0 left-2 right-2 h-1 bg-blue-600 rounded-t-full" />}
                        </button>

                        {tripDays.map((item, index) => {
                            const isActive = selectedDayId === item.id;
                            const dParts = item.id.split('/');
                            const shortDate = `${dParts[0]}/${dParts[1]}`;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedDayId(item.id)}
                                    className={`flex flex-col items-center justify-center min-w-[72px] px-2 pb-3 pt-2 relative transition-all ${isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{shortDate}</span>
                                    <span className={`text-sm tracking-tight mt-0.5 ${isActive ? 'font-black' : 'font-bold'}`}>第{index + 1}天</span>
                                    {isActive && <div className="absolute bottom-0 left-2 right-2 h-1 bg-slate-900 rounded-t-full" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto px-5 py-6 no-scrollbar relative bg-slate-50/30">

                    {activePhaseTitle && selectedDayId !== 'all' && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-2xl shadow-lg relative overflow-hidden flex items-center justify-between">
                                <div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Phase</span>
                                    <h3 className="text-sm font-black text-white leading-tight tracking-tight">{activePhaseTitle}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedDayId === 'all' ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <Globe size={48} className="text-slate-200" />
                            <div>
                                <h3 className="text-base font-black text-slate-800">總覽模式</h3>
                                <p className="text-xs text-slate-400 font-bold mt-1">目前顯示整趟旅程的所有地點。<br />請選擇特定日期查看詳細行程時間軸。</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeItems.length > 0 ? (
                                activeItems.map((item, index) => (
                                    <div key={item.id}>
                                        {index > 0 && (
                                            <div className="relative h-8 group -mt-6 mb-2 z-30 ml-3">
                                                <div className="absolute left-11 top-0 bottom-0 w-0.5 bg-slate-200" />
                                                <button onClick={() => openInsertForm(index)} className="absolute left-[45px] top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:scale-110 transition-all shadow-sm z-20"><Plus size={12} strokeWidth={3} /></button>
                                            </div>
                                        )}
                                        <ItineraryItemCard
                                            {...item}
                                            index={index}
                                            moveItem={handleDragDropReorder}
                                            onDragEnd={handleDragEnd}
                                            onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
                                            onDelete={() => deleteItem(item.id)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-slate-100 shadow-sm mx-1">
                                    <Calendar size={32} className="text-slate-300" />
                                    <div><p className="text-sm font-black text-slate-900">這天還沒有行程</p><p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">點擊上方 + 按鈕開始規劃吧！</p></div>
                                </div>
                            )}

                            {activeItems.length > 0 && (
                                <div className="relative h-14 group -mt-6 z-30 ml-3">
                                    <div className="absolute left-11 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 to-transparent" />
                                    <button onClick={() => { setInsertIndex(null); setShowForm(true); }} className="absolute left-[45px] top-6 -translate-x-1/2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-all shadow-lg active:scale-90 z-20"><Plus size={16} strokeWidth={3} /></button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {(showForm || editingItem) && (
                <ItineraryForm onClose={() => { setShowForm(false); setEditingItem(null); setInsertIndex(null); }} onSave={handleSave} initialData={editingItem} baseTime={baseTime} />
            )}
            {showBulkEdit && (
                <BulkEditModal
                    initialItems={items.filter(item => item.trip_id === (activeTrip?.id || 'europe-2026'))}
                    onClose={() => setShowBulkEdit(false)}
                    onSave={(updatedTripItems) => {
                        const otherTripItems = items.filter(item => item.trip_id !== (activeTrip?.id || 'europe-2026'));
                        onItemsChange([...otherTripItems, ...updatedTripItems]);
                    }}
                    currentDayId={selectedDayId === 'all' ? tripDays[0]?.id || '' : selectedDayId}
                    activeTrip={activeTrip}
                />
            )}
        </div>
    );
}

// Ensure the component handles drag and drop interactions correctly on touch devices if needed via a polyfill or advanced DnD library, 
// but standard HTML5 DnD works well enough for basic testing now.
