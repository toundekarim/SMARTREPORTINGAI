import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Partner } from '../types';

const Partners = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPartner, setNewPartner] = useState({
        name: '',
        email: '',
        desc: '',
        country: '',
        frequency: 'mensuelle',
        contractStart: new Date().toISOString().split('T')[0],
        contractEnd: new Date(Date.now() + 31536000000).toISOString().split('T')[0] // +1 year
    });

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

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddPartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        console.log("Submitting new partner:", newPartner);
        try {
            const response = await axios.post('http://localhost:3000/api/partners', {
                name: newPartner.name,
                contact_email: newPartner.email,
                description: newPartner.desc,
                country: newPartner.country,
                meeting_frequency: newPartner.frequency,
                contract_start_date: newPartner.contractStart,
                contract_end_date: newPartner.contractEnd
            });
            console.log("Partner created successfully:", response.data);
            setIsModalOpen(false);
            setNewPartner({
                name: '',
                email: '',
                desc: '',
                country: '',
                frequency: 'mensuelle',
                contractStart: new Date().toISOString().split('T')[0],
                contractEnd: new Date(Date.now() + 31536000000).toISOString().split('T')[0]
            });
            fetchData();
        } catch (err) {
            console.error("Error creating partner", err);
            alert("Erreur lors de la création du partenaire. Vérifiez la console.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeletePartner = async (id: number, name: string) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le partenaire "${name}" ? Cette action est irréversible.`)) {
            try {
                await axios.delete(`http://localhost:3000/api/partners/${id}`);
                setPartners(partners.filter(p => p.id !== id));
            } catch (err) {
                console.error("Error deleting partner", err);
                alert("Erreur lors de la suppression du partenaire.");
            }
        }
    };

    if (loading) return <div className="p-8 text-center font-bold text-lux-slate animate-pulse">Chargement des partenaires...</div>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Portefeuille LuxDev</h2>
                    <h1 className="text-3xl font-black text-lux-slate tracking-tight">Entreprises Partenaires</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-lux-teal text-white rounded-2xl font-bold shadow-lg shadow-lux-teal/20 hover:scale-105 transition-all"
                >
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
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDeletePartner(partner.id, partner.name)}
                                        className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        title="Supprimer le partenaire"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <Link
                                        to={`/partners/${partner.id}`}
                                        className="p-3 bg-lux-slate/5 text-lux-slate rounded-xl hover:bg-lux-slate hover:text-white transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </Link>
                                </div>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-lux-slate/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative">
                        <h2 className="text-2xl font-black text-lux-slate mb-6">Nouveau Partenaire</h2>
                        <form onSubmit={handleAddPartner} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Nom de l'entreprise</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all"
                                    placeholder="ex: Alpha Solutions"
                                    value={newPartner.name}
                                    onChange={e => setNewPartner({ ...newPartner, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Email de contact</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all"
                                    placeholder="contact@entreprise.lu"
                                    value={newPartner.email}
                                    onChange={e => setNewPartner({ ...newPartner, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Début du contrat</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all"
                                        value={newPartner.contractStart}
                                        onChange={e => setNewPartner({ ...newPartner, contractStart: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Fin du contrat</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all"
                                        value={newPartner.contractEnd}
                                        onChange={e => setNewPartner({ ...newPartner, contractEnd: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all h-24"
                                    placeholder="Quels sont les services proposés ?"
                                    value={newPartner.desc}
                                    onChange={e => setNewPartner({ ...newPartner, desc: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Pays d'origine</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all"
                                    placeholder="ex: Sénégal"
                                    value={newPartner.country}
                                    onChange={e => setNewPartner({ ...newPartner, country: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Fréquence des réunions</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all appearance-none cursor-pointer"
                                    value={newPartner.frequency}
                                    onChange={e => setNewPartner({ ...newPartner, frequency: e.target.value })}
                                >
                                    <option value="aucune">Aucune réunion automatique</option>
                                    <option value="hebdomadaire">Hebdomadaire (Toutes les semaines)</option>
                                    <option value="mensuelle">Mensuelle (Tous les mois)</option>
                                    <option value="annuelle">Annuelle (Tous les ans)</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAdding}
                                    className={`flex-1 px-6 py-3 rounded-2xl font-bold transition-all ${isAdding ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-lux-teal text-white shadow-lg shadow-lux-teal/20 hover:scale-[1.02]'}`}
                                >
                                    {isAdding ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Partners;
