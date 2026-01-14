import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ContractProgress from '../components/ContractProgress';
import ProjectEvolutionChart from '../components/ProjectEvolutionChart';
import ReportTemplateView from '../components/ReportTemplateView';
import {
    Building2,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    FileText,
    AlertCircle,
    CheckCircle2,
    Plus,
    Calendar as CalendarIcon,
    TrendingUp
} from 'lucide-react';

const PartnerDetail = () => {
    const { id } = useParams();
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartner = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/partners/${id}`);
                setPartner(res.data);
            } catch (err) {
                console.error("Error fetching partner", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPartner();
    }, [id]);

    if (loading) return <div className="p-8 text-center font-bold text-lux-slate animate-pulse">Chargement des données...</div>;
    if (!partner) return <div className="p-8 text-center text-red-500 font-bold">Partenaire non trouvé</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {/* Header / Back navigation */}
            <div className="flex items-center gap-4">
                <Link
                    to="/partners"
                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-lux-teal hover:border-lux-teal transition-all rounded-2xl shadow-sm"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-lux-slate tracking-tight">{partner.name}</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Fiche Partenaire Direct • LuxDev</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Info */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="glass p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Building2 size={120} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 bg-lux-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-lux-blue/20">
                                <Building2 size={32} />
                            </div>

                            <p className="text-slate-500 font-medium leading-relaxed italic">
                                "{partner.description}"
                            </p>

                            <div className="space-y-4 pt-6">
                                <div className="flex items-center gap-3 text-sm font-bold text-lux-slate">
                                    <Mail className="text-lux-teal" size={18} />
                                    {partner.contact_email}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-400">
                                    <MapPin className="text-lux-teal" size={14} />
                                    Luxembourg
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contract Box */}
                    <section className="glass p-8 rounded-[2.5rem] border-lux-teal/20 bg-gradient-to-br from-white/80 to-lux-teal/5">
                        <div className="flex items-center gap-2 mb-6">
                            <AlertCircle size={18} className="text-lux-teal" />
                            <h3 className="font-black text-lux-slate uppercase tracking-wider text-xs">Suivi Administratif</h3>
                        </div>
                        <ContractProgress
                            startDate={partner.contract_start_date}
                            endDate={partner.contract_end_date}
                        />
                    </section>

                    {/* Report Template View */}
                    {partner.templates && partner.templates.length > 0 && (
                        <section className="glass p-8 rounded-[2.5rem]">
                            <ReportTemplateView template={partner.templates[0]} />
                        </section>
                    )}
                </div>

                {/* Right Column: Projects & Evolution */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass p-8 rounded-[2.5rem]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2">
                                <TrendingUp size={20} className="text-lux-teal" />
                                Évolution & Projets
                            </h3>
                            <button className="p-2 bg-lux-blue/10 text-lux-blue rounded-xl hover:bg-lux-blue hover:text-white transition-all">
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="space-y-10">
                            {partner.projects.map((project: any) => (
                                <div key={project.id} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:border-lux-teal transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-lg font-black text-lux-slate mb-1">
                                                {project.title}
                                            </h4>
                                            <p className="text-xs text-slate-400 font-medium">{project.description}</p>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-lux-teal bg-lux-teal/10 px-3 py-1 rounded-full">
                                            {project.status}
                                        </span>
                                    </div>

                                    {/* Evolution Chart Integration */}
                                    {project.evolution_data && (
                                        <ProjectEvolutionChart data={project.evolution_data} />
                                    )}

                                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Identifiant</p>
                                            <p className="text-sm font-bold text-lux-slate">PRJ-{project.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Lancement</p>
                                            <p className="text-sm font-bold text-lux-slate">{new Date(project.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Standard Reports List */}
                    <section className="glass p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2 mb-8">
                            <CalendarIcon size={20} className="text-amber-500" />
                            Historique des Rapports
                        </h3>

                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-dotted border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-slate-400" />
                                        <span className="text-sm font-bold text-slate-600">Rapport d'activité mensuel M{i}</span>
                                    </div>
                                    <CheckCircle2 size={18} className="text-lux-teal" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PartnerDetail;
