import { useState } from 'react';
import { X, Save, FileText, Table as TableIcon, Trash2, Plus, AlertCircle, Search, MapPin } from 'lucide-react';

import type { ItineraryItem, Trip } from '../types/trip';

interface BulkEditModalProps {
    onClose: () => void;
    onSave: (items: ItineraryItem[]) => void;
    initialItems: ItineraryItem[];
    currentDayId: string;
    activeTrip: Trip | null;
}

export function BulkEditModal({ onClose, onSave, initialItems, currentDayId, activeTrip }: BulkEditModalProps) {
    const [mode, setMode] = useState<'import' | 'edit'>('import');
    const [rawText, setRawText] = useState('');
    const [editedItems, setEditedItems] = useState<ItineraryItem[]>(initialItems);
    const [error, setError] = useState<string | null>(null);

    const formatTime = (timeStr: string) => {
        const timeMatch = timeStr.match(/(\d{1,2}[:：]\d{2}(?:\s?[AaPp][Mm])?)/);
        if (!timeMatch) return "09:00 AM";

        let normalized = timeMatch[1].replace('：', ':').trim().toUpperCase();
        const hasAM = normalized.includes('AM');
        const hasPM = normalized.includes('PM');

        let [hPart, mPart] = normalized.replace(/[AP]M/, '').trim().split(':').map(Number);

        // Handle AM/PM
        if (hasPM && hPart < 12) hPart += 12;
        if (hasAM && hPart === 12) hPart = 0;

        const modifier = hPart >= 12 ? 'PM' : 'AM';
        const displayH = hPart % 12 || 12;
        return `${displayH.toString().padStart(2, '0')}:${mPart.toString().padStart(2, '0')} ${modifier}`;
    };

    const handleParse = () => {
        try {
            const lines = rawText.split('\n').filter(l => l.trim() !== '');
            const finalItems: ItineraryItem[] = [];

            lines.forEach((line, lineIdx) => {
                const parts = line.split(',').map(p => p.trim());
                if (parts.length < 1) return;

                // 1. Detect Date from first part or use current
                const dateMatch = parts[0].match(/(\d+\/\d+)/);
                const dayId = dateMatch ? dateMatch[1] : currentDayId;

                // If the first part was a date, the rest is the content
                let content = dateMatch ? parts.slice(1).join(', ') : line;

                // 2. Smarter Splitting: Find all time markers (HH:mm, HH：mm, with AM/PM)
                const timeRegex = /(\d{1,2}[:：]\d{2}(?:\s?[AaPp][Mm])?)/g;
                const matches = Array.from(content.matchAll(timeRegex));

                if (matches.length > 0) {
                    // Split content by time markers
                    matches.forEach((match, matchIdx) => {
                        const startTime = match.index!;
                        const endTime = matches[matchIdx + 1] ? matches[matchIdx + 1].index : content.length;
                        const segment = content.substring(startTime, endTime).trim();

                        const time = formatTime(match[0]);
                        // Further split segment by comma to find transport/duration
                        const segmentParts = segment.replace(match[0], '').split(',').map(p => p.trim().replace(/^[・\s\-*]+|[・\s\-*,]+$/g, '')).filter(p => p !== '');

                        const title = segmentParts[0] || "新行程";
                        const transport = segmentParts[1] || "";
                        const duration = segmentParts[2] || "";
                        const description = segmentParts.slice(3).join(', ') || "";

                        finalItems.push({
                            id: `bulk-${Date.now()}-${lineIdx}-${matchIdx}`,
                            trip_id: activeTrip?.id || 'europe-2026',
                            dayId,
                            time,
                            title,
                            transport,
                            duration,
                            description,
                            isBranch: false,
                            participants: []
                        });
                    });
                } else {
                    // Fallback for lines without a clear time marker
                    // Use comma-based logic
                    finalItems.push({
                        id: `bulk-${Date.now()}-${lineIdx}`,
                        trip_id: activeTrip?.id || 'europe-2026',
                        dayId,
                        time: "09:00 AM",
                        title: parts[0].replace(/^[・\s\-*]+|[・\s\-*,]+$/g, '') || "新行程",
                        transport: parts[1] || "",
                        duration: parts[2] || "",
                        description: parts.slice(3).join(', ') || "",
                        isBranch: false,
                        participants: []
                    });
                }
            });

            if (finalItems.length === 0) {
                setError("無法識別任何行程目標。建議格式：8/31, 09:00 抵達, 交通, 停留, 備註");
                return;
            }

            setEditedItems(finalItems);
            setMode('edit');
            setError(null);
        } catch (e) {
            console.error(e);
            setError("解析發生錯誤，請檢查文字內容。");
        }
    };

    const updateItem = <K extends keyof ItineraryItem>(id: string, field: K, value: ItineraryItem[K]) => {
        setEditedItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeItem = (id: string) => {
        setEditedItems(prev => prev.filter(item => item.id !== id));
    };

    const addItem = () => {
        const newItem: ItineraryItem = {
            id: `new-${Date.now()}`,
            trip_id: activeTrip?.id || 'europe-2026',
            dayId: currentDayId,
            time: "09:00 AM",
            title: "新行程",
            description: "",
            duration: "1 小時",
            transport: "",
            isBranch: false,
            participants: []
        };
        setEditedItems(prev => [...prev, newItem]);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-white/20">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            {mode === 'import' ? <FileText className="text-blue-600" /> : <TableIcon className="text-indigo-600" />}
                            {mode === 'import' ? '大口批量匯入' : '多項同步編輯'}
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {mode === 'import' ? '貼上文字（支援一行多個時間點），自動為您解析排程' : '像試算表一樣快速調整所有行程'}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-90">
                        <X size={24} />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex px-8 py-4 gap-4 bg-white border-b border-slate-50">
                    <button
                        onClick={() => setMode('import')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${mode === 'import' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        📝 貼上文字匯入
                    </button>
                    <button
                        onClick={() => setMode('edit')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${mode === 'edit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        📊 表格同步編輯
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden p-8">
                    {mode === 'import' ? (
                        <div className="h-full flex flex-col gap-6 animate-in slide-in-from-left-4 duration-500">
                            <div className="flex-1 relative">
                                <textarea
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    placeholder="貼上文字，格式可以是：&#10;8/31, 09:00 起床, 10:00 出發, 🚘 包車, 半天, 🍽️ 餐廳&#10;(支援一行偵測多個時間點，將自動拆分卡片)"
                                    className="w-full h-full p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] text-sm font-medium focus:border-blue-500/30 focus:bg-white outline-none transition-all scrollbar-hide resize-none leading-relaxed"
                                />
                                {error && (
                                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-bounce">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleParse}
                                className="w-full py-5 bg-blue-600 text-white font-black rounded-[24px] shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-3"
                            >
                                <SparklesIcon />
                                我貼好了，開始解析行程！
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col gap-4 animate-in slide-in-from-right-4 duration-500">
                            <div className="flex-1 overflow-auto border border-slate-100 rounded-[32px] bg-slate-50/30 scrollbar-hide">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                                        <tr className="border-b border-slate-100">
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">日期</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">時間</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">標題</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">地點</th>
                                            <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">停留</th>
                                            <th colSpan={2} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pr-8">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {editedItems.map((item) => (
                                            <tr key={item.id} className="group hover:bg-white transition-colors">
                                                <td className="p-2 pl-8">
                                                    <input
                                                        type="text"
                                                        value={item.dayId}
                                                        onChange={(e) => updateItem(item.id, 'dayId', e.target.value)}
                                                        className="w-16 px-2 py-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-[11px] font-black"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.time}
                                                        onChange={(e) => updateItem(item.id, 'time', e.target.value)}
                                                        className="w-24 px-2 py-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-[11px] font-black text-blue-600"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.title}
                                                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                                        className="w-full px-2 py-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-xs font-black"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={item.location || ''}
                                                            onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                                                            placeholder="點擊右側搜尋 ➔"
                                                            className="w-full px-2 py-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-[11px] font-medium text-slate-500"
                                                        />
                                                        <button
                                                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location || item.title)}`, '_blank')}
                                                            className="p-1.5 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                                                            title="在 Google Maps 中搜尋"
                                                        >
                                                            <Search size={14} />
                                                        </button>
                                                        {item.location && (
                                                            <div className="text-green-500"><MapPin size={12} /></div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.duration || ''}
                                                        onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                                                        className="w-20 px-2 py-2 bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-[11px] font-bold text-amber-600"
                                                    />
                                                </td>
                                                <td className="p-2 pr-8 w-10">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button
                                onClick={addItem}
                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-xs font-black"
                            >
                                <Plus size={16} /> 新增一行
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Footer */}
                <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-white">
                    <div className="text-[10px] font-black text-slate-400 bg-slate-100 px-4 py-2 rounded-full uppercase tracking-tighter">
                        共計 {editedItems.length} 個行程項目
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-8 py-3 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95">
                            取消
                        </button>
                        <button
                            onClick={() => { onSave(editedItems); onClose(); }}
                            className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Save size={18} /> 同步所有變更
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SparklesIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3L14.5 9L21 12L14.5 15L12 21L9.5 15L3 12L9.5 9L12 3Z" fill="currentColor" />
        </svg>
    );
}
