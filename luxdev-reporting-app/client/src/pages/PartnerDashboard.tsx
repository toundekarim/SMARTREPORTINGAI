import {
    FileText,
    Bell,
    Clock,
    AlertCircle,
    Building2,
    Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import ContractProgress from '../components/ContractProgress';

const PartnerDashboard = () => {
    // Mock data for the partner user
    const partnerInfo = {
        name: 'Alpha Solutions',
        contract_start: '2024-01-01',
        contract_end: '2026-12-31',
        active_projects: 2,
        pending_reports: 3,
        next_meeting: 'Maintenant, 10:00 - Comité de Pilotage'
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Top Alert Bar */}
            <div className="bg-lux-teal text-white p-4 rounded-3xl flex items-center justify-between shadow-lg shadow-lux-teal/20 pr-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Bell size={20} className="text-white animate-ring" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Alerte Prochaine Échéance</p>
                        <p className="font-bold text-sm">Remise du rapport "Migration Cloud Q4" attendue avant le 31 Mars.</p>
                    </div>
                </div>
                <button className="bg-white text-lux-teal px-4 py-1.5 rounded-xl font-black text-[10px] uppercase shadow-md hover:scale-105 transition-all">
                    Soumettre maintenant
                </button>
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
                            startDate={partnerInfo.contract_start}
                            endDate={partnerInfo.contract_end}
                        />
                    </section>

                    <section className="glass p-8 rounded-[2.5rem] bg-lux-slate text-white">
                        <div className="flex items-center gap-2 mb-6 text-lux-teal">
                            <AlertCircle size={18} />
                            <h3 className="font-black uppercase tracking-wider text-[10px]">Urgent : Meeting</h3>
                        </div>
                        <p className="text-xl font-black leading-tight mb-4">
                            {partnerInfo.next_meeting}
                        </p>
                        <div className="flex items-center gap-2 text-white/40 text-xs font-bold">
                            <Clock size={14} />
                            <span>15 Janvier 2026 • LuxDev HQ</span>
                        </div>
                    </section>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Projects Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { title: 'Migration Cloud AWS', progress: 75, color: 'bg-lux-teal' },
                            { title: 'Sécurisation Endpoint', progress: 40, color: 'bg-lux-blue' }
                        ].map((project, i) => (
                            <section key={i} className="glass p-8 rounded-[2.5rem] group hover:scale-[1.02] transition-all cursor-pointer">
                                <FileText className="text-lux-slate/20 mb-4 group-hover:text-lux-teal transition-colors" size={32} />
                                <h4 className="font-black text-lux-slate mb-6">{project.title}</h4>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                        <span>Progression globale</span>
                                        <span className="text-lux-slate">{project.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${project.progress}%` }}
                                            className={`h-full ${project.color}`}
                                        ></motion.div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Pending Reports List */}
                    <section className="glass p-8 rounded-[2.5rem]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-lux-slate tracking-tight flex items-center gap-2">
                                <Send size={20} className="text-lux-teal" />
                                Rapports à Soumettre
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: 'État des Lieux Infrastructures', deadline: '31 Janv. 2026', type: 'Technique' },
                                { title: 'Audit de Gouvernance IT', deadline: '15 Févr. 2026', type: 'Final' }
                            ].map((report, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:border-lux-teal transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-2xl text-slate-400 group-hover:text-lux-teal transition-all shadow-sm">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lux-slate">{report.title}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{report.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-slate-300 mb-1">Deadline</p>
                                            <p className="text-sm font-bold text-lux-slate">{report.deadline}</p>
                                        </div>
                                        <button className="p-2 bg-lux-teal text-white rounded-xl shadow-lg shadow-lux-teal/10 hover:bg-lux-blue transition-colors">
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PartnerDashboard;
