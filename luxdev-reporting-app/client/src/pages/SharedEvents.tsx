import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Users, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SharedEvents = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const url = user?.role === 'admin'
                    ? 'http://localhost:3000/api/events'
                    : `http://localhost:3000/api/events?partnerId=${user?.partner_id}`;
                const res = await axios.get(url);
                setEvents(res.data);
            } catch (err) {
                console.error("Error fetching events:", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchEvents();
    }, [user]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const months = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUI', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = months[date.getMonth()];
        const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        return { day, month, time };
    };

    if (loading) return <div className="p-8 text-center font-bold text-lux-slate animate-pulse">Chargement de l'agenda...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Agenda Collaboratif</h2>
                    <h1 className="text-3xl font-black text-lux-slate tracking-tight">Événements & Dates Clés</h1>
                </div>
                <div className="flex gap-4">
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {events.length > 0 ? events.map((event, i) => {
                    const { day, month, time } = formatDate(event.event_date);
                    return (
                        <div
                            key={event.id}
                            className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 group hover:border-lux-teal transition-all animate-in fade-in slide-in-from-right-4 duration-500"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {/* Date badge */}
                            <div className="w-32 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-lux-teal group-hover:text-white transition-all">
                                <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white/70">{month}</span>
                                <span className="text-4xl font-black text-lux-slate group-hover:text-white leading-none my-1">
                                    {day}
                                </span>
                                <span className="text-[10px] font-black uppercase text-lux-teal group-hover:text-white/70 bg-lux-teal/5 px-2 py-0.5 rounded-full group-hover:bg-white/20">
                                    {time}
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

                                <p className="text-slate-400 text-sm italic">{event.description}</p>

                                <div className="flex flex-wrap gap-6 items-center">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                        <Users size={16} className="text-lux-teal" />
                                        {event.partner_name || 'Tous les partenaires'}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                                        <MapPin size={16} className="text-lux-teal" />
                                        {event.location || 'Consultation en ligne'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                            </div>
                        </div>
                    );
                }) : (
                    <div className="p-12 text-center glass rounded-[2.5rem] border-dashed border-2 border-slate-200">
                        <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold">Aucun événement prévu prochainement.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedEvents;
