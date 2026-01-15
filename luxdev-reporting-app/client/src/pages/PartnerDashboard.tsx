import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Bell,
    Clock,
    AlertCircle,
    Building2,
    TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import ContractProgress from '../components/ContractProgress';
import AITemplateGenerator from '../components/AITemplateGenerator';

const PartnerDashboard = () => {
    const { user } = useAuth();
    const [partnerData, setPartnerData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.partner_id) return;

        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/partners/${user.partner_id}`);
                setPartnerData(res.data);
            } catch (err) {
                console.error("Error fetching partner dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) return <div className="p-8 text-center font-bold text-lux-slate animate-pulse">Chargement de votre espace...</div>;
    if (!partnerData) return <div className="p-8 text-center text-red-500 font-bold">Données non trouvées</div>;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {/* Top Alert Bar */}
            <div className="bg-lux-teal text-white p-4 rounded-3xl flex items-center justify-between shadow-lg shadow-lux-teal/20 pr-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Bell size={20} className="text-white animate-ring" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Alerte Prochaine Échéance</p>
                        <p className="font-bold text-sm">Bienvenue sur votre portail. N'oubliez pas de consulter les référentiels ci-dessous.</p>
                    </div>
                </div>
                <Link
                    to="/my-projects"
                    className="bg-white text-lux-teal px-4 py-1.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:scale-105 transition-all"
                >
                    Mes projets
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contract Status Card */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="glass p-8 rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-lux-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-lux-slate tracking-tight">Mon Partenariat</h3>
                                <p className="text-[10px] font-black uppercase text-lux-teal">Contrat Actif</p>
                            </div>
                        </div>

                        <ContractProgress
                            startDate={partnerData.contract_start_date}
                            endDate={partnerData.contract_end_date}
                        />
                    </section>

                    <section className="glass p-8 rounded-[2.5rem] bg-lux-slate text-white">
                        <div className="flex items-center gap-2 mb-6 text-lux-teal">
                            <AlertCircle size={18} />
                            <h3 className="font-black uppercase tracking-wider text-[10px]">Prochaine Réunion</h3>
                        </div>
                        {(() => {
                            const now = new Date();
                            const upcomingEvents = (partnerData.events || [])
                                .filter((e: any) => new Date(e.event_date) >= now)
                                .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

                            const nextMeeting = upcomingEvents[0];

                            if (!nextMeeting) {
                                return (
                                    <>
                                        <p className="text-xl font-black leading-tight mb-4">Pas de réunion prévue</p>
                                        <div className="flex items-center gap-2 text-white/40 text-xs font-bold">
                                            <Clock size={14} />
                                            <span>--/--/----</span>
                                        </div>
                                    </>
                                );
                            }

                            return (
                                <>
                                    <p className="text-xl font-black leading-tight mb-4">{nextMeeting.title}</p>
                                    <div className="flex items-center gap-2 text-white/40 text-xs font-bold">
                                        <Clock size={14} />
                                        <span>
                                            {new Date(nextMeeting.event_date).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </>
                            );
                        })()}
                    </section>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Projects Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {partnerData.projects && partnerData.projects.slice(0, 2).map((project: any, i: number) => (
                            <section key={i} className="glass p-8 rounded-[2.5rem] group hover:scale-[1.02] transition-all cursor-pointer">
                                <TrendingUp className="text-lux-slate/20 mb-4 group-hover:text-lux-teal transition-colors" size={32} />
                                <h4 className="font-black text-lux-slate mb-6 truncate">{project.title}</h4>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                        <span>Progression globale</span>
                                        <span className="text-2xl font-black text-lux-blue">
                                            {project.evolution_data && project.evolution_data.length > 0
                                                ? project.evolution_data[project.evolution_data.length - 1].prog
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.evolution_data && project.evolution_data.length > 0 ? project.evolution_data[project.evolution_data.length - 1].prog : 0}%` }}
                                            className="h-full bg-lux-teal"
                                        ></motion.div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* IA Template Generator for Partners */}
                    <AITemplateGenerator
                        partnerId={user?.partner_id || 0}
                        onTemplateApplied={() => {
                            // Re-fetch data to show the new template in the list if needed
                            window.location.reload();
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PartnerDashboard;
