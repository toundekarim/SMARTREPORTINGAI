import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProjectEvolutionChart from '../components/ProjectEvolutionChart';
import {
    LayoutGrid,
    List,
    TrendingUp,
    Clock,
    CheckCircle2
} from 'lucide-react';

const MyProjects = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        if (!user?.partner_id) return;

        const fetchProjects = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/partners/${user.partner_id}/projects`);
                setProjects(res.data);
            } catch (err) {
                console.error("Error fetching projects", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [user]);

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center font-bold text-lux-slate animate-pulse">Chargement de vos projets...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-lux-slate tracking-tight">Mes Projets en Cours</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Espace Partenaire • LuxDev Coordination</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 p-1 rounded-2xl flex gap-1 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-lux-blue text-white shadow-lg shadow-lux-blue/20' : 'text-slate-400 hover:text-lux-blue'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-lux-blue text-white shadow-lg shadow-lux-blue/20' : 'text-slate-400 hover:text-lux-blue'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {filteredProjects.length === 0 && !loading && (
                <div className="glass p-20 text-center rounded-[2.5rem]">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <TrendingUp size={40} />
                    </div>
                    <h3 className="text-xl font-black text-lux-slate mb-2">Aucun projet trouvé</h3>
                    <p className="text-slate-400 font-medium">Réessayez avec d'autres mots-clés.</p>
                </div>
            )}

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filteredProjects.map((project) => (
                        <Link to={`/projects/${project.id}`} key={project.id} className="block group">
                            <div className="glass p-8 rounded-[2.5rem] flex flex-col h-full hover:border-lux-teal hover:shadow-2xl hover:shadow-lux-teal/5 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-lux-teal bg-lux-teal/10 px-2 py-0.5 rounded-lg">PRJ-{project.id}</span>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">Priorité Haute</span>
                                        </div>
                                        <h3 className="text-xl font-black text-lux-slate group-hover:text-lux-teal transition-colors">{project.title}</h3>
                                    </div>
                                    <div className={`p-2 rounded-xl ${project.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                        <TrendingUp size={20} />
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                                    {project.description}
                                </p>

                                <div className="mb-8">
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                            <Clock size={14} className="text-lux-teal" />
                                            Évolution
                                        </span>
                                        <span className="text-2xl font-black text-lux-blue">
                                            {project.evolution_data && project.evolution_data.length > 0
                                                ? project.evolution_data[project.evolution_data.length - 1].prog
                                                : 0}%
                                        </span>
                                    </div>
                                    <ProjectEvolutionChart data={project.evolution_data} />
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-50 text-right">
                                    <span className="text-[10px] font-black uppercase text-lux-teal opacity-0 group-hover:opacity-100 transition-opacity">
                                        Accéder au Référentiel →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="glass overflow-hidden rounded-[2.5rem]">
                    <div className="divide-y divide-slate-50">
                        {filteredProjects.map(project => (
                            <Link to={`/projects/${project.id}`} key={project.id} className="block group">
                                <div className="p-6 hover:bg-lux-teal/5 flex items-center justify-between transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-lux-blue shadow-sm group-hover:scale-110 transition-transform">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lux-slate group-hover:text-lux-teal transition-colors">{project.title}</h4>
                                            <p className="text-xs text-slate-400 font-medium">{project.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-12">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-slate-300">Progression</p>
                                            <p className="text-lg font-black text-lux-blue">
                                                {project.evolution_data && project.evolution_data.length > 0
                                                    ? project.evolution_data[project.evolution_data.length - 1].prog
                                                    : 0}%
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                <CheckCircle2 size={12} />
                                                {project.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProjects;
