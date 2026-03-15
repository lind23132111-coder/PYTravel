import { Search, ExternalLink, Navigation, MapPin } from 'lucide-react';
import { openGoogleMaps, openGoogleMapsDirections } from '../lib/maps';

export function LocationSearch() {
    return (
        <div className="space-y-4">
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="搜尋地點..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">已儲存的地點</span>
                    <MapPin size={14} className="text-blue-500" />
                </div>

                <div className="divide-y divide-slate-50">
                    {[
                        { name: '漁人堡', area: '1區, 布達佩斯', id: 'ChIJX998-A8JAWARmNidmx_cKYY' },
                        { name: '聖伊什特萬聖殿', area: '5區, 布達佩斯', id: 'ChIJ8f8U8Q8JAWARmNidmx_cKYY' },
                    ].map((place) => (
                        <div key={place.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">{place.name}</h4>
                                <p className="text-[10px] text-slate-500 font-medium">{place.area}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openGoogleMaps(place.name, place.id)}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                >
                                    <ExternalLink size={16} />
                                </button>
                                <button
                                    onClick={() => openGoogleMapsDirections(place.name, place.id)}
                                    className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <Navigation size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
