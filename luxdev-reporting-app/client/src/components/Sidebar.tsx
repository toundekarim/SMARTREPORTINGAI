import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    LogOut
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const adminLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/partners', label: 'Partenaires', icon: Users },
        { to: '/events', label: 'Calendrier', icon: Calendar },
    ];

    const partnerLinks = [
        { to: '/partner-dashboard', label: 'Mon Espace', icon: LayoutDashboard },
        { to: '/my-projects', label: 'Mes Projets', icon: FileText },
        { to: '/events', label: 'Calendrier', icon: Calendar },
    ];

    const links = user?.role === 'admin' ? adminLinks : partnerLinks;

    return (
        <aside className="w-64 h-screen bg-lux-slate text-white fixed left-0 top-0 flex flex-col z-20 shadow-2xl">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-lux-teal rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ring-2 ring-white/20">
                        LX
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none">LuxDev</h1>
                        <span className="text-[10px] uppercase tracking-widest text-lux-teal font-bold">Portal v2</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                            isActive
                                ? "bg-lux-teal text-white shadow-lg shadow-lux-teal/20 translate-x-1"
                                : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <link.icon size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-lux-blue flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
                        {user?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="truncate">
                        <p className="text-sm font-bold truncate">{user?.name}</p>
                        <p className="text-[10px] text-white/40 uppercase font-bold">{user?.role}</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
