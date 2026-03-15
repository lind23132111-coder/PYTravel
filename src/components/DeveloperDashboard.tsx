import { LayoutDashboard, FileText, Activity, Database, RefreshCw } from 'lucide-react'

export function DeveloperDashboard() {
    if (import.meta.env.PROD) return null;

    return (
        <div className="fixed bottom-20 right-4 z-50">
            <details className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 max-w-xs transition-all group">
                <summary className="list-none cursor-pointer flex items-center justify-between gap-3 font-semibold text-xs opacity-70 group-open:opacity-100 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard size={16} />
                        <span>Dev Console</span>
                    </div>
                    <Activity size={12} className="text-green-400 animate-pulse" />
                </summary>

                <div className="mt-4 space-y-4 text-[11px] font-mono leading-relaxed">
                    <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-2 mb-1 text-slate-400">
                            <FileText size={14} />
                            <span>Active Milestone</span>
                        </div>
                        <p className="text-blue-300">#v1.0.0-beta.1 (Initial MVP)</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-slate-500 tracking-tighter">
                            <span>DB SYNC STATUS</span>
                            <span className="text-green-500 flex items-center gap-1">
                                <Database size={10} /> Connected
                            </span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-blue-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                            <span className="block text-slate-500 text-[9px] mb-0.5">MOCK DATA</span>
                            <span className="text-yellow-400 font-bold">STRICT_MOCK</span>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                            <span className="block text-slate-500 text-[9px] mb-0.5">COMPONENTS</span>
                            <span className="text-emerald-400 font-bold">128_LOADED</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-slate-500 text-[9px]">DOCS PARTITION:</span>
                        <div className="flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-slate-300 border border-slate-700">task.md</span>
                            <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-slate-300 border border-slate-700">implementation_plan.md</span>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <RefreshCw size={12} />
                        FORCE SYSTEM REFRESH
                    </button>
                </div>
            </details>
        </div>
    )
}
