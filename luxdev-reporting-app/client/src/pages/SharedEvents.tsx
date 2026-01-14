import { MapPin, Users, Plus } from 'lucide-react';

const SharedEvents = () => {
    const events = [
        { id: 1, title: 'Comité de Pilotage Q1', date: '2026-01-15', time: '10:00', type: 'meeting', partner: 'Alpha Solutions', location: 'LuxDev HQ' },
        { id: 2, title: 'Remise Rapport Environnemental', date: '2026-01-16', time: '17:00', type: 'deadline', partner: 'Green Energy', location: 'Portail Web' },
        { id: 3, title: 'Conférence Partenaires 2026', date: '2026-01-20', time: '09:00', type: 'meeting', partner: 'Tous les partenaires', location: 'Hôtel Royal, Lux' },
        { id: 4, title: 'Débriefing Migration Cloud', date: '2026-01-22', time: '14:00', type: 'meeting', partner: 'Alpha Solutions', location: 'Teams Online' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Agenda Collaboratif</h2>
                    <h1 className="text-3xl font-black text-lux-slate tracking-tight">Événements & Dates Clés</h1>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 text-lux-slate rounded-2xl font-bold shadow-sm hover:border-lux-teal transition-all">
                        Vue Calendrier
                    </button>
                    <button className="px-6 py-3 bg-lux-teal text-white rounded-2xl font-bold shadow-lg shadow-lux-teal/20 hover:scale-105 transition-all flex items-center gap-2">
                        <Plus size={18} /> Organiser
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {events.map((event, i) => (
                    <div
                        key={event.id}
                        className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 group hover:border-lux-teal transition-all animate-in fade-in slide-in-from-right-4 duration-500"
                        style={{ animationDelay: `${i * 100}ms` }}
                    >
                        {/* Date badge */}
                        <div className="w-32 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-lux-teal group-hover:text-white transition-all">
                            <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white/70">JAN</span>
                            <span className="text-4xl font-black text-lux-slate group-hover:text-white leading-none my-1">
                                {event.date.split('-')[2]}
                            </span>
                            <span className="text-[10px] font-black uppercase text-lux-teal group-hover:text-white/70 bg-lux-teal/5 px-2 py-0.5 rounded-full group-hover:bg-white/20">
                                {event.time}
                            </span>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${event.type === 'meeting' ? 'bg-lux-blue/10 text-lux-blue' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    {event.type}
                                </span>
                                <h3 className="text-xl font-black text-lux-slate tracking-tight group-hover:text-lux-teal transition-colors">
                                    {event.title}
                                </h3>
                            </div>

                            <div className="flex flex-wrap gap-6 items-center">
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                    <Users size={16} className="text-lux-teal" />
                                    {event.partner}
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                    <MapPin size={16} className="text-lux-teal" />
                                    {event.location}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="px-4 py-2 text-xs font-black uppercase text-lux-slate hover:bg-slate-100 rounded-xl transition-all">
                                Détails
                            </button>
                            <button className="px-6 py-2 bg-lux-slate text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-lux-slate/10 hover:bg-lux-teal hover:shadow-lux-teal/20 transition-all">
                                Participer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SharedEvents;
