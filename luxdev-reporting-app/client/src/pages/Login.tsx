
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, User as UserIcon, Lock, ArrowRight, Sparkles, Eye, EyeOff, Building2, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const { login, isAuthenticated, user } = useAuth();
    const [userType, setUserType] = useState<'luxdev' | 'partner'>('luxdev');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [enterpriseName, setEnterpriseName] = useState('');

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Common Validation
            if (!email || !password) {
                throw new Error("Veuillez remplir l'email et le mot de passe");
            }

            const emailLower = email.toLowerCase();

            // ---------------------------------------------------------
            // LUXDEV MEMBER FLOW
            // ---------------------------------------------------------
            if (userType === 'luxdev') {
                if (!jobTitle) {
                    throw new Error("Veuillez renseigner votre poste");
                }

                // Format Check
                if (!emailLower.endsWith('@luxdev.lu')) {
                    throw new Error("L'email doit terminer par @luxdev.lu");
                }

                // Generic Admin Block
                if (emailLower === 'admin@luxdev.lu') {
                    throw new Error("L'accès générique 'admin' est interdit. Utilisez votre email nominatif.");
                }

                // Name format check (firstname.lastname or firstname-lastname)
                const nameRegex = /^[a-z]+[.-][a-z]+@luxdev\.lu$/;
                if (!nameRegex.test(emailLower)) {
                    throw new Error("Format invalide. Utilisez: prenom.nom@luxdev.lu");
                }

                // Password check (mock)
                if (password.length < 4) {
                    throw new Error("Mot de passe incorrect");
                }

                // Success
                // Extract proper name from email: karim.tounde -> Karim Tounde
                const namePart = emailLower.split('@')[0]; // karim.tounde
                const formattedName = namePart
                    .split(/[.-]/)
                    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(' ');

                await login('admin', undefined, formattedName);
            }

            // ---------------------------------------------------------
            // PARTNER FLOW
            // ---------------------------------------------------------
            else {
                if (!enterpriseName) {
                    throw new Error("Veuillez renseigner le nom de votre entreprise");
                }

                // Fetch partners to verify
                const res = await fetch('http://localhost:3000/api/partners');
                const partners = await res.json();

                const foundPartner = partners.find((p: any) => p.contact_email && p.contact_email.toLowerCase() === emailLower);

                if (!foundPartner) {
                    throw new Error("Cet email n'est associé à aucun partenaire enregistré.");
                }

                // Verify Enterprise Name Match (Case insensitive check)
                const dbName = foundPartner.name.toLowerCase();
                const inputName = enterpriseName.toLowerCase();

                // We check if the input name is contained in the DB name or vice-versa to allow partial matches
                // Or strictly equal? User asked "tu verifies toujours". Let's be reasonably strict but allow flexibility.
                // Let's do a loose check: input must be part of DB name OR DB name part of input logic? 
                // Better: Input must be included in DB name seems safer, or vice versa? 
                // Let's demand that the input name provided by user is somewhat accurate.
                if (!dbName.includes(inputName) && !inputName.includes(dbName)) {
                    throw new Error(`Le nom de l'entreprise ne correspond pas à l'email fourni. (Attendu: ${foundPartner.name})`);
                }

                if (password.length < 4) {
                    throw new Error("Mot de passe incorrect");
                }

                // Success
                await login('partner', foundPartner.id, foundPartner.name);
            }

        } catch (err: any) {
            console.error("Login error:", err);
            setError(err.message || "Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    };

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
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-lux-teal rounded-2xl flex items-center justify-center font-bold text-3xl shadow-xl ring-2 ring-white/30 mb-4">
                            LX
                        </div>
                        <h2 className="text-2xl font-black text-lux-slate tracking-tight">Portail LuxDev</h2>
                    </div>

                    {/* Toggle User Type */}
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => setUserType('luxdev')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userType === 'luxdev' ? 'bg-white text-lux-slate shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Membre LuxDev
                        </button>
                        <button
                            type="button"
                            onClick={() => setUserType('partner')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${userType === 'partner' ? 'bg-white text-lux-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Partenaire
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 text-[10px] font-bold rounded-xl text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lux-teal transition-colors" size={18} />
                            <input
                                type="email"
                                placeholder={userType === 'luxdev' ? "Email LuxDev (prenom.nom@luxdev.lu)" : "Email de contact partenaire"}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all text-xs font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Specific Fields */}
                        {userType === 'luxdev' ? (
                            <div className="relative group animate-in fade-in slide-in-from-left-2">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lux-teal transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Votre poste (ex: Chef de projet)"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all text-xs font-medium"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="relative group animate-in fade-in slide-in-from-right-2">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lux-blue transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Nom de votre entreprise"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-blue/20 focus:border-lux-blue transition-all text-xs font-medium"
                                    value={enterpriseName}
                                    onChange={(e) => setEnterpriseName(e.target.value)}
                                />
                            </div>
                        )}

                        {/* Password */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lux-teal transition-colors" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mot de passe"
                                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all text-xs font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-lux-slate transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 text-white rounded-xl font-bold shadow-lg shadow-lux-slate/20 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed ${userType === 'luxdev' ? 'bg-lux-slate hover:bg-lux-slate/90' : 'bg-lux-blue hover:bg-lux-blue/90'}`}
                        >
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                            {!isLoading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    {/* Quick Access Footer - Still useful for prototype but kept subtle */}
                    <div className="mt-8 pt-4 border-t border-slate-100 flex justify-center">
                        <span className="text-[9px] text-slate-300 uppercase font-black tracking-widest">Prototype v1.0</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
