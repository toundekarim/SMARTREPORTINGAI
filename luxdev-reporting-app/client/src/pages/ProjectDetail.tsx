import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Building2, TrendingUp, FileText, BookOpen, Calendar, Check } from 'lucide-react';
import ReportTemplateView from '../components/ReportTemplateView';
import AITemplateGenerator from '../components/AITemplateGenerator';
import ProjectEvolutionChart from '../components/ProjectEvolutionChart';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState<any>(null);
    const [partner, setPartner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [projectReports, setProjectReports] = useState<any[]>([]);

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
                const [partnerRes, reportsRes] = await Promise.all([
                    axios.get(`http://localhost:3000/api/partners/${projectRes.data.partner_id}`),
                    axios.get(`http://localhost:3000/api/reports?projectId=${id}`)
                ]);
                setPartner(partnerRes.data);

                // Filter reports for this project specifically if API doesn't filter perfectly
                const relevantReports = reportsRes.data.filter((r: any) => r.project_id === parseInt(id!));
                console.log("Project reports fetched:", relevantReports);
                setProjectReports(relevantReports);
            }

        } catch (err) {
            console.error("Error fetching project details", err);
        } finally {
            setLoading(false);
        }
    };

    const getProgressionData = () => {
        if (!project) return [];

        console.log("Calculating progression for project:", project.title);

        // Find latest deadline
        const deadlines = projectReports
            .filter(r => r.deadline)
            .map(r => new Date(r.deadline).getTime());

        console.log("Found deadlines:", deadlines);

        if (deadlines.length === 0) {
            console.log("No deadlines found, using evolution_data:", project.evolution_data);
            return project.evolution_data || [];
        }

        const createdDate = project.created_at || new Date().toISOString();
        const start = new Date(createdDate).getTime();
        const end = Math.max(...deadlines);

        if (isNaN(start) || isNaN(end) || end <= start) {
            return project.evolution_data || [];
        }

        // Generate 5 points for the graph
        const points = [];
        const duration = end - start;

        for (let i = 0; i <= 4; i++) {
            const pointTime = start + (duration * i) / 4;
            const pointDate = new Date(pointTime);

            // Calculate theoretical progress at this point in time
            // If the point is in the past, prog is determined by time elapsed
            // If the point is in the future, it's a projection
            let prog = Math.round(((pointTime - start) / duration) * 100);
            if (prog < 0) prog = 0;
            if (prog > 100) prog = 100;

            points.push({
                date: pointDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                prog: prog
            });
        }
        return points;
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

            // Re-fetch data to update the chart immediately
            fetchProjectData();
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
                    to={isAdmin ? (partner ? `/partners/${partner.id}` : "/partners") : "/my-projects"}
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

            <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'max-w-4xl mx-auto'} gap-8`}>
                {/* Left Column: Project Info & Templates */}
                <div className={`${isAdmin ? 'lg:col-span-1' : 'w-full'} space-y-8`}>
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
                                projectId={project.id}
                                partnerId={project.partner_id}
                                showMediaOptions={!isAdmin}
                                hideSubmit={isAdmin}
                            />

                            {isAdmin && (
                                <div className="mt-10 pt-8 space-y-8 relative z-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-lux-blue" />
                                            <span className="text-[10px] font-black uppercase text-lux-slate tracking-widest">Échéance de rendu</span>
                                        </div>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-lux-blue/5 focus:border-lux-blue transition-all text-xs font-bold"
                                            value={newReport.deadline}
                                            onChange={e => setNewReport({ ...newReport, deadline: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        onClick={handleAssignReport}
                                        disabled={isAssigningReport}
                                        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-lux-blue/10 ${assignSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-lux-blue text-white hover:bg-lux-blue/90 hover:-translate-y-0.5 active:translate-y-0'}`}
                                    >
                                        {assignSuccess ? (
                                            <>
                                                <Check size={18} />
                                                Référentiel Validé
                                            </>
                                        ) : (
                                            <>
                                                <Check size={18} />
                                                Valider le Référentiel
                                            </>
                                        )}
                                    </button>

                                    <p className="text-[9px] text-slate-400 font-medium text-center uppercase tracking-tighter opacity-60">
                                        L'échéance sera automatiquement ajoutée à l'agenda du partenaire
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* AI Template Generator (Specific for this project content ideally, but using partner context) */}
                    {isAdmin && partner && (
                        <AITemplateGenerator
                            partnerId={partner.id}
                            onTemplateApplied={() => {
                                // Refresh logic if needed
                                window.location.reload();
                            }}
                        />
                    )}
                </div>

                {/* Right Column: Evolution & Stats (Only for Admin) */}
                {isAdmin && (
                    <div className="lg:col-span-2 space-y-8">
                        {/* Evolution Chart */}
                        <section className="glass p-8 rounded-[2.5rem]">
                            <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2 mb-8">
                                <TrendingUp size={20} className="text-lux-teal" />
                                Progression vers l'Échéance
                            </h3>
                            {projectReports.some(r => r.deadline) ? (
                                <ProjectEvolutionChart data={getProgressionData()} />
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                    <p className="text-slate-400 text-sm font-medium">Fixez une deadline dans le référentiel pour activer le suivi visuel</p>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetail;
