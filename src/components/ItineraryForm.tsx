import React, { useState, useMemo, useEffect } from 'react';
import { X, Clock, MapPin, Timer, Car, Save, Footprints, TrainFront, Plane, Sparkles } from 'lucide-react';
import type { ItineraryItem } from '../types/trip';

// Helper: parse "HH:MM AM/PM" → total minutes from midnight
const parseTimeToMinutes = (t: string): number | null => {
    try {
        const [timeStr, modifier] = t.trim().split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    } catch { return null; }
};

// Helper: diff in minutes (handles overnight)
const timeDiffMinutes = (dep: string, arr: string): number | null => {
    const d = parseTimeToMinutes(dep);
    const a = parseTimeToMinutes(arr);
    if (d === null || a === null) return null;
    let diff = a - d;
    if (diff < 0) diff += 24 * 60; // overnight flight
    return diff;
};

const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} 分鐘`;
    if (m === 0) return `${h} 小時`;
    return `${h} 小時 ${m} 分鐘`;
};

interface ItineraryFormProps {
    onClose: () => void;
    onSave: (item: ItineraryItem) => void;
    initialData: ItineraryItem | null;
    baseTime?: string;
}

const TRANSPORT_TYPES = [
    { id: 'walk', icon: Footprints, label: '步行', defaultDuration: 10, defaultUnit: '分鐘' },
    { id: 'car', icon: Car, label: '開車', defaultDuration: 20, defaultUnit: '分鐘' },
    { id: 'transit', icon: TrainFront, label: '大眾運輸', defaultDuration: 30, defaultUnit: '分鐘' },
    { id: 'flight', icon: Plane, label: '飛機', defaultDuration: 2, defaultUnit: '小時' },
];

const TIME_UNITS = ["分鐘", "小時"];

// Helper to add time
const addTime = (baseTimeStr: string, value: number, unit: string): string => {
    try {
        const [timeStr, modifier] = baseTimeStr.split(' ');
        const [hoursRaw, minutes] = timeStr.split(':').map(Number);
        let hours = hoursRaw;
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        let totalMinutes = hours * 60 + minutes;
        totalMinutes += unit === '小時' ? value * 60 : value;

        let nextHours = Math.floor(totalMinutes / 60) % 24;
        const nextMinutes = Math.floor(totalMinutes % 60);
        const nextModifier = nextHours >= 12 ? 'PM' : 'AM';
        nextHours = nextHours % 12 || 12;

        return `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')} ${nextModifier}`;
    } catch {
        return baseTimeStr;
    }
};

export function ItineraryForm({ onClose, onSave, initialData, baseTime }: ItineraryFormProps) {
    // Parse initialData once
    const parsedInitial = useMemo(() => {
        const durationInfo = { value: '', unit: '小時', isSpecial: false };
        if (initialData?.duration) {
            if (initialData.duration === "辦理入住") {
                durationInfo.isSpecial = true;
            } else {
                const match = initialData.duration.match(/(\d+(\.\d+)?)\s*(小時|分鐘)/);
                if (match) {
                    durationInfo.value = match[1];
                    durationInfo.unit = match[3];
                }
            }
        }

        const transportInfo = { type: 'car', value: '', unit: '分鐘' };
        if (initialData?.transport) {
            const [label, dur] = initialData.transport.split('・');
            transportInfo.type = TRANSPORT_TYPES.find(t => t.label === label)?.id || 'car';
            if (dur) {
                const match = dur.match(/(\d+(\.\d+)?)\s*(小時|分鐘)/);
                if (match) {
                    transportInfo.value = match[1];
                    transportInfo.unit = match[3];
                }
            }
        }

        return { durationInfo, transportInfo };
    }, [initialData]);

    // Time is manual or suggested (moved early so flightDurationMin can use it)
    const [manualTime, setManualTime] = useState<string | null>(initialData?.time || null);

    // Split transport state
    const [transportType, setTransportType] = useState(parsedInitial.transportInfo.type);
    const [transValue, setTransValue] = useState(parsedInitial.transportInfo.value);
    const [transUnit, setTransUnit] = useState(parsedInitial.transportInfo.unit);

    // Dynamic Suggested Time based on baseTime + Current Transport
    const dynamicSuggestedTime = useMemo(() => {
        if (!baseTime) return null;
        const val = parseFloat(transValue) || 0;
        return addTime(baseTime, val, transUnit);
    }, [baseTime, transValue, transUnit]);

    const currentTime = manualTime || dynamicSuggestedTime || '09:00 AM';

    // ── Flight mode state ──────────────────────────────────────
    const [isFlightMode, setIsFlightMode] = useState(false);
    const [flightNumber, setFlightNumber] = useState('');
    const [departureAirport, setDepartureAirport] = useState('');
    const [arrivalAirport, setArrivalAirport] = useState('');
    const [arrivalTime, setArrivalTime] = useState('09:00 AM');

    // Auto-calculated flight duration (in minutes)
    const flightDurationMin = useMemo(() => {
        if (!isFlightMode) return null;
        return timeDiffMinutes(currentTime, arrivalTime);
    }, [isFlightMode, currentTime, arrivalTime]);

    // When flight mode is toggled on, auto-set transport to 飛機
    useEffect(() => {
        if (isFlightMode) {
            setTransportType('flight');
            setTransValue('2');
            setTransUnit('小時');
        }
    }, [isFlightMode]);

    // ── Standard item state ──────────────────────────────────────
    const [title, setTitle] = useState(initialData?.title || '');
    const [location, setLocation] = useState(initialData?.location || '');
    const [description, setDescription] = useState(initialData?.description || '');

    // Split duration state
    const [stayValue, setStayValue] = useState(parsedInitial.durationInfo.value);
    const [stayUnit, setStayUnit] = useState(parsedInitial.durationInfo.unit);
    const [isSpecialStay, setIsSpecialStay] = useState(parsedInitial.durationInfo.isSpecial);

    // Branch / Participants state
    const [isBranch, setIsBranch] = useState(initialData?.isBranch || false);
    const [participants, setParticipants] = useState(initialData?.participants?.join(', ') || '');


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let finalTitle = title;
        let finalLocation = location;
        let finalDuration = isSpecialStay ? "辦理入住" : `${stayValue || '0'} ${stayUnit}`;
        let finalTransport = `${TRANSPORT_TYPES.find(t => t.id === transportType)?.label}・${transValue || '0'} ${transUnit}`;

        if (isFlightMode) {
            const fn = flightNumber ? ` (${flightNumber})` : '';
            finalTitle = `【起飛】${departureAirport} ✈️ ${arrivalAirport}${fn}`;
            finalLocation = departureAirport;
            if (flightDurationMin !== null) {
                finalDuration = formatDuration(flightDurationMin);
            }
            finalTransport = `飛機・${flightDurationMin !== null ? formatDuration(flightDurationMin) : '?'}`;
        }

        onSave({
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            trip_id: initialData?.trip_id || 'europe-2026',
            dayId: initialData?.dayId || '8/31',
            time: currentTime,
            title: finalTitle,
            location: finalLocation,
            description,
            duration: finalDuration,
            transport: finalTransport,
            isBranch,
            participants: participants.split(',').map((p: string) => p.trim()).filter((p: string) => p !== '')
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-6 pb-scroll-safe animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto relative outline-none border border-slate-100 mb-safe">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {initialData ? '編輯行程' : '新增排程'}
                        </h3>
                        {baseTime && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                                接續自前一個行程的空檔
                            </p>
                        )}
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all active:scale-90">
                        <X size={24} />
                    </button>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-slate-100 p-1.5 rounded-[22px] gap-1 h-[48px] items-center mb-6">
                    <button
                        type="button"
                        onClick={() => setIsFlightMode(false)}
                        className={`flex-1 h-full text-[11px] font-black rounded-[15px] transition-all flex items-center justify-center gap-1.5 ${!isFlightMode ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        🎯 一般行程
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsFlightMode(true)}
                        className={`flex-1 h-full text-[11px] font-black rounded-[15px] transition-all flex items-center justify-center gap-1.5 ${isFlightMode ? 'bg-white text-sky-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        ✈️ 航班
                    </button>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>

                    {/* ─── FLIGHT MODE FIELDS ─── */}
                    {isFlightMode ? (
                        <div className="space-y-5 p-5 bg-sky-50/60 rounded-[24px] border border-sky-100">
                            <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">✈️ 航班資訊</p>

                            {/* Flight Number */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">航班號碼 (選填)</label>
                                <input
                                    type="text"
                                    value={flightNumber}
                                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                    placeholder="例如 BR055"
                                    className="w-full px-5 py-4 bg-white border-2 border-transparent rounded-[20px] text-sm font-black focus:border-sky-300 outline-none shadow-inner tracking-widest"
                                />
                            </div>

                            {/* Departure + Arrival airports */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">出發機場</label>
                                    <div className="relative">
                                        <Plane size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            value={departureAirport}
                                            onChange={(e) => setDepartureAirport(e.target.value)}
                                            placeholder="桃園 (TPE)"
                                            className="w-full pl-8 pr-3 py-4 bg-white border-2 border-transparent rounded-[20px] text-xs font-black focus:border-sky-300 outline-none shadow-inner"
                                            required={isFlightMode}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">抵達機場</label>
                                    <div className="relative">
                                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            value={arrivalAirport}
                                            onChange={(e) => setArrivalAirport(e.target.value)}
                                            placeholder="維也納 (VIE)"
                                            className="w-full pl-8 pr-3 py-4 bg-white border-2 border-transparent rounded-[20px] text-xs font-black focus:border-sky-300 outline-none shadow-inner"
                                            required={isFlightMode}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Departure + Arrival times */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">出發時間</label>
                                    <div className="relative">
                                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type="text"
                                            value={currentTime}
                                            onChange={(e) => setManualTime(e.target.value)}
                                            placeholder="11:30 PM"
                                            className="w-full pl-8 pr-3 py-4 bg-white border-2 border-transparent rounded-[20px] text-xs font-black focus:border-sky-300 outline-none shadow-inner"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">抵達時間</label>
                                    <div className="relative">
                                        <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" />
                                        <input
                                            type="text"
                                            value={arrivalTime}
                                            onChange={(e) => setArrivalTime(e.target.value)}
                                            placeholder="06:10 AM"
                                            className="w-full pl-8 pr-3 py-4 bg-white border-2 border-transparent rounded-[20px] text-xs font-black focus:border-sky-300 outline-none shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Auto-calculated duration preview */}
                            {flightDurationMin !== null && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-sky-100/60 rounded-[16px]">
                                    <Plane size={14} className="text-sky-500" />
                                    <span className="text-xs font-black text-sky-700">飛行時間自動計算：{formatDuration(flightDurationMin)}</span>
                                </div>
                            )}
                        </div>
                    ) : (

                        /* ─── STANDARD FIELDS ─── */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">預定開始時間</label>
                                <div className="relative group">
                                    <Clock size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${manualTime ? 'text-blue-500' : 'text-slate-300'}`} />
                                    <input
                                        type="text"
                                        value={currentTime}
                                        onChange={(e) => setManualTime(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] text-sm font-black focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none shadow-inner"
                                    />
                                </div>
                                {!manualTime && dynamicSuggestedTime && (
                                    <div className="flex items-center gap-1.5 px-2">
                                        <Sparkles size={12} className="text-blue-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">智能計算：已自動為您排定</span>
                                    </div>
                                )}
                                {manualTime && (
                                    <button
                                        type="button"
                                        onClick={() => setManualTime(null)}
                                        className="text-[10px] font-bold text-slate-400 hover:text-blue-500 px-2 flex items-center gap-1 transition-colors"
                                    >
                                        <X size={10} /> 恢復自動排定
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">景點或活動名稱</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="這站要去哪？"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] text-sm font-black focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none shadow-inner"
                                    required={!isFlightMode}
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">地點位置 (Google Maps)</label>
                            <div className="relative group">
                                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="地址或地標"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] text-[11px] font-medium focus:border-blue-500/20 focus:bg-white outline-none shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">預估停留長度</label>
                            <div className="flex flex-wrap gap-2 items-center">
                                {isSpecialStay ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsSpecialStay(false)}
                                        className="flex-1 min-h-[56px] bg-amber-50 text-amber-600 border-2 border-amber-100 rounded-[20px] font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                    >
                                        🏨 已設為辦理入住 (點擊取消)
                                    </button>
                                ) : (
                                    <div className="relative flex-[2] min-w-[100px] min-h-[56px] group flex items-center bg-slate-50 border-2 border-transparent rounded-[20px] focus-within:bg-white focus-within:border-blue-500/20 transition-all shadow-inner">
                                        <Timer size={16} className="absolute left-4 text-slate-400" />
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={stayValue}
                                            onChange={(e) => setStayValue(e.target.value)}
                                            placeholder="時間"
                                            className="w-full pl-11 pr-3 py-4 bg-transparent border-none text-sm font-black outline-none appearance-none"
                                        />
                                    </div>
                                )}
                                <div className="flex bg-slate-100 p-1.5 rounded-[22px] gap-1 shrink-0 h-[56px] items-center">
                                    {TIME_UNITS.map(unit => (
                                        <button
                                            key={unit}
                                            type="button"
                                            onClick={() => { setStayUnit(unit); setIsSpecialStay(false); }}
                                            className={`px-3.5 h-full text-[10px] font-black rounded-[15px] transition-all ${!isSpecialStay && stayUnit === unit ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setIsSpecialStay(true)}
                                        className={`px-3 h-full text-[10px] font-black rounded-[15px] transition-all ${isSpecialStay ? 'bg-white text-amber-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        入住
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">抵達此站的交通方式</label>
                        <div className="space-y-4">
                            <div className="flex p-2 bg-slate-100/50 rounded-[24px] gap-2">
                                {TRANSPORT_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => {
                                            setTransportType(type.id);
                                            setTransValue(type.defaultDuration.toString());
                                            setTransUnit(type.defaultUnit);
                                        }}
                                        className={`flex-1 flex flex-col items-center py-3.5 rounded-[18px] transition-all ${transportType === type.id
                                            ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/10 scale-105 ring-1 ring-blue-50'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <type.icon size={20} />
                                        <span className="text-[9px] font-black mt-2 uppercase tracking-tight">{type.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <div className="relative flex-[2] min-w-[100px] min-h-[56px] group flex items-center bg-slate-50 border-2 border-transparent rounded-[20px] focus-within:bg-white focus-within:border-blue-500/20 transition-all shadow-inner">
                                    <Clock size={16} className="absolute left-4 text-slate-400" />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={transValue}
                                        onChange={(e) => setTransValue(e.target.value)}
                                        placeholder="耗時"
                                        className="w-full pl-11 pr-4 py-4 bg-transparent border-none text-sm font-black outline-none appearance-none"
                                    />
                                </div>
                                <div className="flex bg-slate-100 p-1.5 rounded-[22px] gap-1 shrink-0 h-[56px] items-center">
                                    {TIME_UNITS.map(unit => (
                                        <button
                                            key={unit}
                                            type="button"
                                            onClick={() => setTransUnit(unit)}
                                            className={`px-5 h-full text-[10px] font-black rounded-[15px] transition-all ${transUnit === unit ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">行程類型</label>
                            <div className="flex bg-slate-100 p-1.5 rounded-[22px] gap-1 shrink-0 h-[56px] items-center">
                                <button
                                    type="button"
                                    onClick={() => setIsBranch(false)}
                                    className={`flex-1 h-full text-[10px] font-black rounded-[15px] transition-all flex items-center justify-center gap-2 ${!isBranch ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    🎯 主線行程
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsBranch(true)}
                                    className={`flex-1 h-full text-[10px] font-black rounded-[15px] transition-all flex items-center justify-center gap-2 ${isBranch ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    🌿 支線 / 分單
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">參與人員 (選填)</label>
                            <input
                                type="text"
                                value={participants}
                                onChange={(e) => setParticipants(e.target.value)}
                                placeholder="誰會參加？(逗號分隔)"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-[20px] text-[11px] font-black focus:border-blue-500/20 focus:bg-white outline-none shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-1.5">筆記 / 備註</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="輸入一些筆記或溫馨提醒..."
                            rows={3}
                            className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-medium focus:border-blue-500/20 focus:bg-white outline-none shadow-inner resize-none leading-relaxed"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 bg-blue-600 text-white font-black rounded-[24px] shadow-2xl shadow-blue-500/30 active:scale-95 active:bg-blue-700 transition-all flex items-center justify-center gap-3 mt-4 text-base"
                    >
                        <Save size={22} strokeWidth={3} />
                        確認並儲存排程
                    </button>
                </form>
            </div>
        </div>
    );
}
