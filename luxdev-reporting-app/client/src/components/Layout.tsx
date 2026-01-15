import { useState, useEffect } from 'react';
import { Outlet, Navigate, useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Info, Calendar, FileText, X, Clock } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    const { isAuthenticated, user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const fetchNotifications = async () => {
            try {
                // The /api/events endpoint already merges meetings and reports/deadlines
                const url = user.role === 'admin'
                    ? 'http://localhost:3000/api/events'
                    : `http://localhost:3000/api/events?partnerId=${user.partner_id}`;

                const res = await axios.get(url);
                const data = res.data || [];

                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const filterEnd = new Date(todayStart);
                filterEnd.setDate(todayStart.getDate() + 10); // 10 days window

                const filtered = data.filter((item: any) => {
                    if (!item.event_date) return false;
                    // Robust date parsing (handle T separator or space)
                    const dateStr = item.event_date.includes(' ') ? item.event_date.replace(' ', 'T') : item.event_date;
                    const itemDate = new Date(dateStr);

                    if (isNaN(itemDate.getTime())) return false;

                    // Show in notifications if it's within the window [today, +10 days]
                    // And only if it's not a validated report (for deadlines)
                    const isUpcoming = itemDate >= todayStart && itemDate <= filterEnd;
                    const isRelevant = item.type === 'meeting' || !['validé', 'termine'].includes(item.status?.toLowerCase());

                    return isUpcoming && isRelevant;
                }).map((item: any) => ({
                    ...item,
                    date: item.event_date,
                    displayDate: item.event_date,
                    icon: item.type === 'meeting' ? <Calendar size={14} className="text-lux-teal" /> : <FileText size={14} className="text-amber-500" />
                }));

                setNotifications(filtered);
                setUnreadCount(filtered.length);
                console.log(`[NOTIF] Found ${filtered.length} notifications in 10-day window.`);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const getPlaceholder = () => {
        if (location.pathname.includes('partners') || (location.pathname === '/dashboard' && user?.role === 'admin')) return "Rechercher un partenaire...";
        if (location.pathname.includes('reports')) return "Rechercher un rapport...";
        return "Rechercher un projet...";
    };

    const handleSearch = (val: string) => {
        if (val) {
            if (location.pathname === '/dashboard') {
                navigate(`/partners?q=${encodeURIComponent(val)}`);
                return;
            }
            if (location.pathname === '/partner-dashboard') {
                navigate(`/my-projects?q=${encodeURIComponent(val)}`);
                return;
            }
            setSearchParams({ q: val });
        } else {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('q');
            setSearchParams(newParams);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8 relative">
                {/* Top bar */}
                <header className="flex justify-between items-center mb-10 min-h-[64px]">
                    <div className="flex-1">
                        {!['/partners', '/events'].includes(location.pathname) ? (
                            <>
                                <h2 className="text-lux-slate/40 text-sm font-bold uppercase tracking-widest mb-1">
                                    {user?.role === 'admin' ? 'Monitoring LuxDev' : 'Espace Partenaire'}
                                </h2>
                                <h1 className="text-3xl font-black text-lux-slate tracking-tight">
                                    Bonjour, {user?.name.split(' ')[0]} 👋
                                </h1>
                            </>
                        ) : (
                            <div className="h-full flex items-center">
                                <div className="h-10"></div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {!['/dashboard', '/partner-dashboard', '/events'].includes(location.pathname) && (
                            <div className="relative group hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lux-teal transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder={getPlaceholder()}
                                    className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-lux-teal/20 focus:border-lux-teal transition-all shadow-sm"
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md relative z-50">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-2.5 rounded-xl transition-all group ${isNotificationsOpen ? 'bg-lux-teal text-white' : 'text-slate-400 hover:text-lux-teal hover:bg-lux-teal/5'}`}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                                )}
                            </button>

                            <div className="w-px h-6 bg-slate-100 mx-1"></div>

                            <button className="p-2.5 text-slate-400 hover:text-lux-blue hover:bg-lux-blue/5 rounded-xl transition-all group relative">
                                <Info size={20} />
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {isNotificationsOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setIsNotificationsOpen(false)}
                                        ></div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-4 w-80 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-40 overflow-hidden"
                                        >
                                            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                                <h3 className="font-black text-lux-slate uppercase tracking-wider text-xs">Notifications</h3>
                                                <button
                                                    onClick={() => {
                                                        setUnreadCount(0);
                                                        setIsNotificationsOpen(false);
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-lux-slate transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notif) => (
                                                        <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group">
                                                            <div className="flex gap-4">
                                                                <div className="mt-1">
                                                                    {notif.icon}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-bold text-lux-slate leading-tight group-hover:text-lux-teal transition-colors">{notif.title}</p>
                                                                    <div className="flex items-center gap-4 mt-2">
                                                                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-400">
                                                                            <Clock size={10} />
                                                                            {(() => {
                                                                                const dStr = notif.displayDate?.includes(' ') ? notif.displayDate.replace(' ', 'T') : notif.displayDate;
                                                                                const d = new Date(dStr);
                                                                                return isNaN(d.getTime()) ? "Date à venir" : d.toLocaleDateString();
                                                                            })()}
                                                                        </div>
                                                                        {user?.role === 'admin' && (
                                                                            <p className="text-[10px] font-black text-lux-blue uppercase">{notif.partner}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center">
                                                        <Bell size={32} className="mx-auto text-slate-100 mb-4" />
                                                        <p className="text-slate-400 text-sm font-medium">Tout est à jour !</p>
                                                    </div>
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <Link
                                                    to="/events"
                                                    onClick={() => setIsNotificationsOpen(false)}
                                                    className="block p-4 text-center text-[10px] font-black uppercase text-lux-teal bg-slate-50/50 hover:bg-lux-teal hover:text-white transition-all tracking-widest"
                                                >
                                                    Voir tout le calendrier
                                                </Link>
                                            )}
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <div className="relative z-10">
                    <Outlet />
                </div>

                <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-lux-teal/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
                <div className="fixed bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-lux-blue/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            </main>
        </div>
    );
};

export default Layout;
