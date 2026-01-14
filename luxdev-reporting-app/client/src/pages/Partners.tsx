import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Partner } from '../types';

const Partners = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/partners');
                setPartners(res.data);
            } catch (err) {
                console.error("Error fetching partners data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center font-bold text-lux-slate animate-pulse">Chargement des partenaires...</div>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
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
                {partners.map((partner) => (
                    <motion.div
                        whileHover={{ y: -5 }}
                        key={partner.id}
                        className="glass group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-2 h-full bg-lux-teal"></div>

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
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active</p>
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
                                {partner.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider mb-1">Email Contact</p>
                                    <p className="text-sm font-bold text-lux-slate truncate">{partner.contact_email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-wider mb-1">Statut Contrat</p>
                                    <p className="text-sm font-bold text-lux-teal">En cours</p>
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
