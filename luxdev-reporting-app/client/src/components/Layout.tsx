import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Info } from 'lucide-react';

const Layout = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 relative">
                {/* Top bar */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-lux-slate/40 text-sm font-bold uppercase tracking-widest mb-1">
                            {user?.role === 'admin' ? 'Monitoring LuxDev' : 'Espace Partenaire'}
                        </h2>
                        <h1 className="text-3xl font-black text-lux-slate tracking-tight">
                            Bonjour, {user?.name.split(' ')[0]} 👋
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lux-teal transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher un projet..."
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all shadow-sm"
                            />
                        </div>

                        <button className="relative p-2 text-slate-400 hover:text-lux-teal hover:bg-lux-teal/10 rounded-xl transition-all">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-50"></span>
                        </button>

                        <button className="p-2 text-slate-400 hover:text-lux-teal hover:bg-lux-teal/10 rounded-xl transition-all">
                            <Info size={22} />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="relative z-10">
                    <Outlet />
                </div>

                {/* Background decorative elements */}
                <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-lux-teal/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
                <div className="fixed bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-lux-blue/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            </main>
        </div>
    );
};

export default Layout;
