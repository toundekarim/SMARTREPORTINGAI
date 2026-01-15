import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const { login, isAuthenticated, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (isAuthenticated) {
        return <Navigate to={user?.role === 'partner' ? '/partner-dashboard' : '/dashboard'} replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-lux-slate relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-lux-teal/20 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-lux-blue/20 blur-[150px] rounded-full animate-pulse [animation-delay:2s]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10 px-6"
            >
                <div className="glass rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-lux-teal rounded-2xl flex items-center justify-center font-bold text-3xl shadow-xl ring-2 ring-white/30 mb-4 animate-bounce">
                            LX
                        </div>
                        <h2 className="text-3xl font-black text-lux-slate tracking-tight mb-2">LuxDev Portal</h2>
                        <p className="text-slate-500 text-sm font-medium">Connectez-vous pour accéder au suivi.</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lux-teal transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-lux-teal/10 focus:border-lux-teal transition-all text-sm font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lux-teal transition-colors" size={20} />
                            <input
                                type="password"
                                placeholder="Mot de passe"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-lux-teal/10 focus:border-lux-teal transition-all text-sm font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button className="w-full py-4 bg-lux-slate text-white rounded-2xl font-bold shadow-xl shadow-lux-slate/20 hover:bg-lux-slate/90 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                            Se connecter
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Quick Access / Demo Mode */}
                    <div className="mt-10 pt-8 border-t border-slate-100">
                        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                            Accès rapide (Mode Prototype)
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => login('admin')}
                                className="flex flex-col items-center gap-2 p-4 bg-lux-teal/5 border border-lux-teal/10 rounded-2xl hover:bg-lux-teal/10 transition-colors group"
                            >
                                <ShieldCheck className="text-lux-teal group-hover:scale-110 transition-transform" size={24} />
                                <span className="text-xs font-bold text-lux-teal">Admin LuxDev</span>
                            </button>
                            <button
                                onClick={() => login('partner')}
                                className="flex flex-col items-center gap-2 p-4 bg-lux-blue/5 border border-lux-blue/10 rounded-2xl hover:bg-lux-blue/10 transition-colors group"
                            >
                                <Sparkles className="text-lux-blue group-hover:scale-110 transition-transform" size={24} />
                                <span className="text-xs font-bold text-lux-blue">Partenaire</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
