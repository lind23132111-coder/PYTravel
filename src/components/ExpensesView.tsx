import { useState } from 'react';
import { Plus, Search, Filter, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { ExpenseForm } from './ExpenseForm';

interface ExpenseItemProps {
    title: string;
    payer: string;
    amount: number;
    currency: string;
    date: string;
    category: string;
}

function ExpenseItemCard({ title, payer, amount, currency, date, category }: ExpenseItemProps) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 active:scale-98 transition-transform">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <Wallet size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 truncate">{title}</h4>
                <p className="text-[10px] text-slate-500 font-medium">
                    付款人 <span className="text-slate-900">{payer}</span> • {date}
                </p>
            </div>
            <div className="text-right">
                <div className="font-black text-slate-900">
                    <span className="text-[10px] mr-0.5">{currency}</span>
                    {amount.toLocaleString()}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {category}
                </div>
            </div>
        </div>
    );
}

import type { Trip } from '../types/trip';

interface ExpensesViewProps {
    activeTrip: Trip | null;
}

export function ExpensesView({ activeTrip }: ExpensesViewProps) {
    const [showForm, setShowForm] = useState(false);

    const mockParticipants = [
        { id: '1', name: '我' },
        { id: '2', name: 'Alice' },
        { id: '3', name: 'Bob' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{activeTrip?.name || '所有行程'} 支出</h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                        旅程預算: <span className="text-emerald-600">$5,000</span>
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-transform"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <ArrowUpRight size={14} className="text-rose-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">累計支出</span>
                    </div>
                    <div className="text-xl font-black text-slate-900">
                        <span className="text-xs mr-1">$</span>1,240
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <ArrowDownLeft size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">剩餘預算</span>
                    </div>
                    <div className="text-xl font-black text-slate-900">
                        <span className="text-xs mr-1">$</span>3,760
                    </div>
                </div>
            </div>

            {/* Filters/Search */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="搜尋支出..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                    />
                </div>
                <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                    <Filter size={20} />
                </button>
            </div>

            {/* Expense List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">近期交易</span>
                    <TrendingUp size={14} className="text-blue-500" />
                </div>

                <ExpenseItemCard
                    title="維也納至布達佩斯私家接送"
                    payer="我"
                    amount={280}
                    currency="EUR"
                    date="8月 31"
                    category="交通"
                />

                <ExpenseItemCard
                    title="多瑙河河景飯店 (3 晚)"
                    payer="Alice"
                    amount={840}
                    currency="EUR"
                    date="8月 31"
                    category="住宿"
                />

                <ExpenseItemCard
                    title="紐約咖啡館晚餐"
                    payer="Bob"
                    amount={32500}
                    currency="HUF"
                    date="9月 01"
                    category="餐飲"
                />

                <ExpenseItemCard
                    title="塞切尼溫泉門票"
                    payer="我"
                    amount={18400}
                    currency="HUF"
                    date="9月 03"
                    category="休閒"
                />
            </div>

            {/* Split Logic Highlight */}
            <div className="p-4 bg-blue-50 rounded-3xl border border-blue-100/50">
                <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    偵測到不對等分帳
                </h5>
                <p className="text-[10px] text-blue-700/80 leading-relaxed font-medium">
                    紐約咖啡館晚餐是以 40/30/30 比例分攤。
                    點擊查看詳細結算細節。
                </p>
            </div>

            {showForm && (
                <ExpenseForm
                    onClose={() => setShowForm(false)}
                    tripParticipants={mockParticipants}
                />
            )}
        </div>
    );
}
