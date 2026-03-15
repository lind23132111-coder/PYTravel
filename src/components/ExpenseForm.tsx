import { useState } from 'react';
import { X, DollarSign, Percent, Calculator } from 'lucide-react';

interface Participant {
    id: string;
    name: string;
    avatar?: string;
}

interface ExpenseFormProps {
    onClose: () => void;
    tripParticipants: Participant[];
}

export function ExpenseForm({ onClose, tripParticipants }: ExpenseFormProps) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'fixed'>('equal');
    const [payerId, setPayerId] = useState(tripParticipants[0]?.id || '');

    // Track shares for each participant
    const [shares, setShares] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        tripParticipants.forEach(p => initial[p.id] = '');
        return initial;
    });

    const handleShareChange = (id: string, value: string) => {
        setShares(prev => ({ ...prev, [id]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-t-[32px] shadow-2xl p-6 pb-scroll-safe animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">新增支出</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    {/* Amount and Description */}
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-2xl">$</div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-3xl font-black text-slate-900 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-200"
                            />
                        </div>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="支出項目是什麼？"
                            className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>

                    {/* User Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">付款人</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {tripParticipants.map(participant => (
                                <button
                                    key={participant.id}
                                    onClick={() => setPayerId(participant.id)}
                                    className={`flex flex-col items-center gap-1.5 min-w-[72px] p-3 rounded-2xl transition-all ${payerId === participant.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border border-slate-100 text-slate-500'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${payerId === participant.id ? 'bg-blue-500' : 'bg-slate-100'
                                        }`}>
                                        {participant.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-[10px] font-bold truncate w-full text-center">{participant.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Split Logic */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">分帳方式</label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {([['equal', '平均'], ['percentage', '比例'], ['fixed', '金額']] as const).map(([type, label]) => (
                                    <button
                                        key={type}
                                        onClick={() => setSplitType(type)}
                                        className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${splitType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                            {tripParticipants.map(participant => (
                                <div key={participant.id} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                                            {participant.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">{participant.name}</span>
                                    </div>

                                    <div className="relative w-24">
                                        {splitType === 'equal' ? (
                                            <div className="text-right text-[11px] font-bold text-slate-400">
                                                {(parseFloat(amount || '0') / tripParticipants.length).toFixed(2)}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                                                    {splitType === 'percentage' ? <Percent size={10} /> : <DollarSign size={10} />}
                                                </div>
                                                <input
                                                    type="number"
                                                    value={shares[participant.id]}
                                                    onChange={(e) => handleShareChange(participant.id, e.target.value)}
                                                    placeholder="0"
                                                    className="w-full pl-6 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-black text-right text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4">
                        <Calculator size={18} />
                        儲存支出
                    </button>
                </form>
            </div>
        </div>
    );
}
