import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Building2, TrendingUp, FileText, BookOpen, Calendar, Send, Check } from 'lucide-react';
import ReportTemplateView from '../components/ReportTemplateView';
import AITemplateGenerator from '../components/AITemplateGenerator';
import ProjectEvolutionChart from '../components/ProjectEvolutionChart';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isAssigningReport, setIsAssigningReport] = useState(false);
    const [assignSuccess, setAssignSuccess] = useState(false);
    const [newReport, setNewReport] = useState({
        title: 'Rapport Mensuel de Suivi',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +7 days
    });

    const isAdmin = user?.role === 'admin';

    const fetchProjectData = async () => {
        try {
            const projectRes = await axios.get(`http://localhost:3000/api/projects/${id}`);
            setProject(projectRes.data);

            if (projectRes.data) {
                const partnerRes = await axios.get(`http://localhost:3000/api/partners/${projectRes.data.partner_id}`);
                setPartner(partnerRes.data);
            }

        } catch (err) {
            console.error("Error fetching project details", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const handleAssignReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAssigningReport(true);
        try {
            await axios.post('http://localhost:3000/api/reports', {
                project_id: id,
                title: newReport.title,
                deadline: newReport.deadline
            });
            setAssignSuccess(true);
            setTimeout(() => setAssignSuccess(false), 3000);
        } catch (err) {
            console.error("Error assigning report", err);
            alert("Erreur lors de l'assignation du rapport.");
        } finally {
            setIsAssigningReport(false);
        }
    };

    if (loading) return <div className="p-8 text-center font-bold text-lux-slate animate-pulse">Chargement du projet...</div>;
    if (!project) return <div className="p-8 text-center text-red-500 font-bold">Projet non trouvé</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    to={partner ? `/partners/${partner.id}` : "/partners"}
                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-lux-teal hover:border-lux-teal transition-all rounded-2xl shadow-sm"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-lux-slate tracking-tight">{project.title}</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-lux-teal bg-lux-teal/10 px-3 py-1 rounded-full">
                            {project.status}
                        </span>
                        {partner && <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Partenaire : {partner.name}</p>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Project Info & Templates */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="glass p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Building2 size={120} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <p className="text-slate-500 font-medium leading-relaxed italic">
                                "{project.description}"
                            </p>

                            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Identifiant</p>
                                    <p className="text-sm font-bold text-lux-slate">PRJ-{project.id}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Création</p>
                                    <p className="text-sm font-bold text-lux-slate">{new Date(project.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Report Repository / Template Selection */}
                    <section className="glass p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2 mb-8">
                            <FileText size={20} className="text-lux-teal" />
                            Référentiel de Rapports
                        </h3>

                        <div className="bg-white border text-left border-slate-100 p-8 rounded-[2rem] shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 text-lux-teal">
                                <BookOpen size={120} />
                            </div>

                            <ReportTemplateView
                                template={{
                                    id: project.id || 999,
                                    title: 'Standard LuxDev Reporting',
                                    requires_video: true,
                                    requires_audio: true,
                                    requires_text: true,
                                    text_formats: 'PDF, DOCX, XLSX',
                                    instructions: 'Utilisez ce modèle pour soumettre vos rapports périodiques de projet. Vous pourrez choisir le type de rapport (Narratif ou Financier) lors du téléchargement.'
                                }}
                                showMediaOptions={false}
                            />

                            {isAdmin && (
                                <div className="mt-10 pt-8 border-t border-slate-100 space-y-6 relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={16} className="text-lux-blue" />
                                        <span className="text-[10px] font-black uppercase text-lux-slate tracking-widest">Assignation au partenaire</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-slate-400 ml-1">Échéance (Deadline)</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all text-xs font-bold"
                                                value={newReport.deadline}
                                                onChange={e => setNewReport({ ...newReport, deadline: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                onClick={handleAssignReport}
                                                disabled={isAssigningReport}
                                                className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${assignSuccess ? 'bg-emerald-500 text-white' : 'bg-lux-blue text-white shadow-lux-blue/20 hover:scale-[1.02]'}`}
                                            >
                                                {assignSuccess ? (
                                                    <>
                                                        <Check size={16} />
                                                        Envoyé au Calendrier
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send size={16} />
                                                        Fixer l'échéance
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-400 italic text-center">
                                        Le partenaire recevra une notification et la date sera ajoutée à l'agenda.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* AI Template Generator (Specific for this project content ideally, but using partner context) */}
                    {partner && (
                        <AITemplateGenerator
                            partnerId={partner.id}
                            onTemplateApplied={() => {
                                // Refresh logic if needed
                                window.location.reload();
                            }}
                        />
                    )}
                </div>

                {/* Right Column: Evolution & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Evolution Chart */}
                    <section className="glass p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2 mb-8">
                            <TrendingUp size={20} className="text-lux-teal" />
                            Évolution du Projet
                        </h3>
                        {project.evolution_data ? (
                            <ProjectEvolutionChart data={project.evolution_data} />
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                <p className="text-slate-400 text-sm font-medium">Aucune donnée d'évolution disponible</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
