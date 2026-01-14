import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Mail, Phone, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Partners = () => {
    const partners = [
        { id: 1, name: 'Alpha Solutions', contact: 'Marc Dupont', desc: 'Infrastructure Cloud & Sécurité', projects: 4, status: 'Active' },
        { id: 2, name: 'Green Energy Co', contact: 'Sara Léo', desc: 'Développement Durable & Audit', projects: 2, status: 'Review' },
        { id: 3, name: 'Build Corp', contact: 'Jean Petit', desc: 'Génie Civil & Construction', projects: 7, status: 'Active' },
        { id: 4, name: 'CyberSec Lux', contact: 'Alex V.', desc: 'Protection des données Sensibles', projects: 1, status: 'Paused' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Portefeuille LuxDev</h2>
                    <h1 className="text-3xl font-black text-lux-slate tracking-tight">Entreprises Partenaires</h1>
                </div>
                <button className="px-6 py-3 bg-lux-teal text-white rounded-2xl font-bold shadow-lg shadow-lux-teal/20 hover:scale-105 transition-all">
                    + Recruter un partenaire
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {partners.map((partner, i) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={partner.id}
                        className="glass group relative overflow-hidden"
                    >
                        {/* Status Stripe */}
                        <div className={`absolute top-0 left-0 w-2 h-full ${partner.status === 'Active' ? 'bg-lux-teal' :
                                partner.status === 'Paused' ? 'bg-red-500' : 'bg-amber-500'
                            }`}></div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-lux-blue border border-slate-100 group-hover:bg-lux-blue group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-lux-slate tracking-tight">
                                            {partner.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{partner.status}</p>
                                    </div>
                                </div>
                                <Link
                                    to={`/partners/${partner.id}`}
                                    className="p-3 bg-lux-slate/5 text-lux-slate rounded-xl hover:bg-lux-slate hover:text-white transition-all"
                                >
                                    <ChevronRight size={18} />
                                </Link>
                            </div>

                            <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
                                {partner.desc}
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider mb-1">Responsable</p>
                                    <p className="text-sm font-bold text-lux-slate">{partner.contact}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider mb-1">Projets actifs</p>
                                    <p className="text-sm font-bold text-lux-slate">{partner.projects} initiatives</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Partners;
