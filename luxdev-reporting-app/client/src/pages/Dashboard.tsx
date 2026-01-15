import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    FileText,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    Calendar as CalendarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProjectEvolutionChart from '../components/ProjectEvolutionChart';

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
    <div className="glass p-6 rounded-[2rem] flex items-center gap-6 group hover:scale-[1.02] transition-all cursor-default">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color} shadow-lg group-hover:rotate-6 transition-transform`}>
            <Icon size={28} className="text-white" />
        </div>
        <div className="flex-1">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black text-lux-slate tracking-tight">{value}</h3>
                {trend && (
                    <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                        <TrendingUp size={12} className="mr-1" /> {trend}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [globalStats, setGlobalStats] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({
        partnersCount: 0,
        projectsCount: 0,
        reportsPending: 0,
        alertsCount: 0
    });
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, summaryRes, eventsRes] = await Promise.all([
                    axios.get('http://localhost:3000/api/stats/global'),
                    axios.get('http://localhost:3000/api/stats/summary'),
                    axios.get('http://localhost:3000/api/events')
                ]);
                setGlobalStats(statsRes.data);
                setSummary(summaryRes.data);
                setUpcomingEvents(eventsRes.data.slice(0, 4));
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            }
        };
        fetchData();
    }, []);

    const isAdmin = user?.role === 'admin';

    const formatEventDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return "Aujourd'hui";
        if (days === 1) return "Demain";
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Stats Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
                {isAdmin && <StatCard label="Partenaires" value={summary.partnersCount} icon={Users} color="bg-lux-blue" trend="+2" />}
                <StatCard label="Projets actifs" value={summary.projectsCount} icon={ArrowUpRight} color="bg-lux-teal" trend="+1" />
                <StatCard label="Rapports en attente" value={summary.reportsPending} icon={FileText} color="bg-amber-500" />
                <StatCard label="Alertes" value={summary.alertsCount} icon={AlertCircle} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Global Evolution Chart */}
                <section className="lg:col-span-2 glass p-8 rounded-[2.5rem] bg-gradient-to-br from-white/70 to-lux-teal/5 border border-lux-teal/10">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2">
                            <TrendingUp size={20} className="text-lux-blue" />
                            Évolution Globale des Projets
                        </h3>
                        <span className="text-[10px] font-black uppercase text-slate-400">Suivi en temps réel</span>
                    </div>

                    <div className="mt-10">
                        <ProjectEvolutionChart data={globalStats} />
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-100/50">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Taux de succès</p>
                            <p className="text-lg font-black text-lux-teal">94%</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Rapports validés</p>
                            <p className="text-lg font-black text-lux-blue">128</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Impact Global</p>
                            <p className="text-lg font-black text-amber-500">Lux+ 2.4</p>
                        </div>
                    </div>
                </section>

                {/* Upcoming Events */}
                <section className="lg:col-span-1 glass p-8 rounded-[2.5rem] relative overflow-hidden">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2">
                            <CalendarIcon size={20} className="text-lux-teal" />
                            Événements
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {upcomingEvents.length > 0 ? upcomingEvents.map((event, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                                <div className={`mt-1 w-2 h-2 rounded-full ${event.type === 'meeting' ? 'bg-lux-teal' : 'bg-amber-500'} group-hover:scale-150 transition-transform`}></div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-xs text-lux-slate truncate">{event.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">{event.partner_name}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md text-slate-500 whitespace-nowrap">
                                        {formatEventDate(event.event_date)}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-slate-400 text-sm italic py-10">Aucun événement à venir</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
