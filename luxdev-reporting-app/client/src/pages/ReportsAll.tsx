import { useState, useEffect } from 'react';
import axios from 'axios';
import { Report } from '../types';
import {
    FileText,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Download
} from 'lucide-react';

const ReportsAll = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/reports');
                setReports(res.data);
            } catch (err) {
                console.error("Error fetching reports", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(filter.toLowerCase()) ||
        r.partner_name?.toLowerCase().includes(filter.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'validé': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'en attente': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'brouillon': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-rose-100 text-rose-700 border-rose-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'validé': return <CheckCircle2 size={16} />;
            case 'en attente': return <Clock size={16} />;
            case 'brouillon': return <FileText size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    if (loading) return <div className="p-8 text-center font-bold text-lux-slate animate-pulse">Chargement des rapports...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-lux-slate tracking-tight">Suivi Global des Rapports</h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Console d'administration LuxDev</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lux-teal transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un rapport..."
                            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-64 focus:outline-none focus:border-lux-teal focus:ring-4 focus:ring-lux-teal/5 transition-all font-medium text-lux-slate placeholder:text-slate-300"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <button className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className="glass overflow-hidden rounded-[2.5rem]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Titre & Projet</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Partenaire</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Soumis le</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Statut</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-wider">Validateur</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-lux-teal/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 shadow-sm transition-transform group-hover:scale-110">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lux-slate group-hover:text-lux-teal transition-colors">{report.title}</p>
                                                <p className="text-xs text-slate-400 font-medium">{report.project_title}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-lux-slate">{report.partner_name}</span>
                                            <span className="text-[10px] font-black uppercase text-slate-300">Luxembourg</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-medium text-slate-500 italic">
                                            {new Date(report.submission_date).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase ${getStatusStyle(report.status)}`}>
                                            {getStatusIcon(report.status)}
                                            {report.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-slate-200 rounded-full border border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {report.reviewer?.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{report.reviewer}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-slate-400 hover:text-lux-blue transition-colors rounded-lg hover:bg-lux-blue/5">
                                                <Download size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-lux-teal transition-colors rounded-lg hover:bg-lux-teal/5">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-gradient-to-r from-lux-blue to-lux-teal p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl shadow-lux-blue/20">
                <div className="space-y-2">
                    <h3 className="text-xl font-black">Besoin d'aide pour l'analyse ?</h3>
                    <p className="text-white/80 text-sm font-medium">L'IA de LuxDev peut générer un récapitulatif global de l'avancement basé sur ces rapports.</p>
                </div>
                <button className="px-6 py-3 bg-white text-lux-blue font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
                    Générer Analyse IA
                </button>
            </div>
        </div>
    );
};

export default ReportsAll;
