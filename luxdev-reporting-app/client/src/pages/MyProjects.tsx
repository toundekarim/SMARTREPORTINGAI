import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProjectEvolutionChart from '../components/ProjectEvolutionChart';
import {
    LayoutGrid,
    List,
    TrendingUp,
    Calendar,
    Plus,
    Clock,
    CheckCircle2
} from 'lucide-react';

const MyProjects = () => {
    const { user } = useAuth();
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
                    <button className="flex items-center gap-2 px-5 py-3 bg-lux-teal text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-lux-teal/20">
                        <Plus size={20} />
                        Nouveau Projet
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {projects.map((project) => (
                        <div key={project.id} className="glass p-8 rounded-[2.5rem] flex flex-col group hover:shadow-2xl hover:shadow-lux-blue/5 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-lux-teal bg-lux-teal/10 px-2 py-0.5 rounded-lg">PRJ-{project.id}</span>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">Priorité Haute</span>
                                    </div>
                                    <h3 className="text-xl font-black text-lux-slate group-hover:text-lux-blue transition-colors">{project.title}</h3>
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
                                        {project.evolution_data[project.evolution_data.length - 1].prog}%
                                    </span>
                                </div>
                                <ProjectEvolutionChart data={project.evolution_data} />
                            </div>

                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        Mise à jour: {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-lux-teal/10 text-lux-teal text-xs font-black rounded-xl hover:bg-lux-teal hover:text-white transition-all">
                                        <Plus size={14} />
                                        Créer un Rapport
                                    </button>
                                    <button className="text-sm font-black text-lux-teal hover:underline decoration-2 underline-offset-4">
                                        Détails
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass overflow-hidden rounded-[2.5rem]">
                    <div className="divide-y divide-slate-50">
                        {projects.map(project => (
                            <div key={project.id} className="p-6 hover:bg-slate-50/50 flex items-center justify-between group transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-lux-blue shadow-sm group-hover:scale-110 transition-transform">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lux-slate group-hover:text-lux-blue transition-colors">{project.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium">{project.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-12">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-slate-300">Progression</p>
                                        <p className="text-lg font-black text-lux-blue">{project.evolution_data[project.evolution_data.length - 1].prog}%</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${project.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            <CheckCircle2 size={12} />
                                            {project.status}
                                        </span>
                                        <button className="p-2 text-slate-300 hover:text-lux-teal transition-colors">
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProjects;
