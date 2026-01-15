import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ContractProgress from '../components/ContractProgress';

import {
    Building2,
    ArrowLeft,
    Mail,
    MapPin,
    FileText,
    AlertCircle,
    Plus,
    Calendar as CalendarIcon
} from 'lucide-react';
import AIReportSummarizer from '../components/AIReportSummarizer';


const PartnerDetail = () => {
    const { id } = useParams();
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isAddingProject, setIsAddingProject] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', desc: '' });



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

    useEffect(() => {
        fetchPartner();
    }, [id]);

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingProject(true);
        console.log("Submitting new project for partner", id, ":", newProject);
        try {
            const response = await axios.post('http://localhost:3000/api/projects', {
                partner_id: id,
                title: newProject.title,
                description: newProject.desc
            });
            console.log("Project created successfully:", response.data);
            setIsProjectModalOpen(false);
            setNewProject({ title: '', desc: '' });
            fetchPartner();
        } catch (err) {
            console.error("Error creating project", err);
            alert("Erreur lors de la création du projet. Vérifiez la console.");
        } finally {
            setIsAddingProject(false);
        }
    };

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
                                    {partner.country || 'Luxembourg'}
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


                </div>

                {/* Right Column: Projects & Evolution */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass p-8 rounded-[2.5rem]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2">
                                <Building2 size={20} className="text-lux-teal" />
                                Projets
                            </h3>
                            <button
                                onClick={() => setIsProjectModalOpen(true)}
                                className="p-2 bg-lux-blue/10 text-lux-blue rounded-xl hover:bg-lux-blue hover:text-white transition-all flex items-center gap-2 px-4 shadow-sm"
                            >
                                <Plus size={18} />
                                <span className="text-xs font-bold uppercase">Nouveau Projet</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {partner.projects && partner.projects.length > 0 ? partner.projects.map((project: any) => (
                                <Link to={`/projects/${project.id}`} key={project.id} className="block group">
                                    <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm group-hover:border-lux-teal transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-lux-teal">
                                            <ArrowLeft className="rotate-180" size={24} />
                                        </div>
                                        <div className="flex justify-between items-start">
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

                                        <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-50">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Identifiant</p>
                                                <p className="text-sm font-bold text-lux-slate">PRJ-{project.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Lancement</p>
                                                <p className="text-sm font-bold text-lux-slate">{new Date(project.created_at || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                    <p className="text-slate-400 text-sm font-medium">Aucun projet actif pour ce partenaire</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* AI Analysis Section for Admin */}
                    <div className="mb-10">
                        <AIReportSummarizer />
                    </div>

                    {/* Standard Reports List */}
                    <section className="glass p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2 mb-8">
                            <CalendarIcon size={20} className="text-amber-500" />
                            Historique des Rapports
                        </h3>

                        <div className="space-y-4">
                            {partner.reports && partner.reports.length > 0 ? partner.reports.map((report: any) => (
                                <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-dotted border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-slate-400" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-600">{report.title}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-medium">{report.project_title} • {new Date(report.deadline).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${report.status === 'validé' ? 'bg-emerald-100 text-emerald-600' :
                                        report.status === 'en attente' ? 'bg-amber-100 text-amber-600' :
                                            'bg-slate-100 text-slate-400'
                                        }`}>
                                        {report.status}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-6">
                                    <p className="text-slate-400 text-xs italic">Aucun rapport disponible</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>

            {/* Project Modal */}
            {isProjectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-lux-slate/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative">
                        <h2 className="text-2xl font-black text-lux-slate mb-6">Nouveau Projet</h2>
                        <form onSubmit={handleAddProject} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Titre du projet</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all"
                                    placeholder="ex: Construction Forage"
                                    value={newProject.title}
                                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Objectif principal</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all h-24"
                                    placeholder="Décrivez les résultats attendus..."
                                    value={newProject.desc}
                                    onChange={e => setNewProject({ ...newProject, desc: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsProjectModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAddingProject}
                                    className={`flex-1 px-6 py-3 rounded-2xl font-bold shadow-lg transition-all ${isAddingProject ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-lux-blue text-white shadow-lux-blue/20 hover:scale-[1.02]'}`}
                                >
                                    {isAddingProject ? 'Création...' : 'Créer le Projet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerDetail;
