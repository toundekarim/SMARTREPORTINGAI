import React from 'react';
import { differenceInDays, formatDistanceStrict } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
    startDate: string;
    endDate: string;
}

const ContractProgress: React.FC<Props> = ({ startDate, endDate }) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    const totalDays = differenceInDays(end, start);
    const daysPassed = differenceInDays(today, start);
    const daysLeft = differenceInDays(end, today);

    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    // Calculate readable time left
    const timeLeftStr = formatDistanceStrict(end, today, { locale: fr });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Temps de contrat restant</p>
                    <p className="text-2xl font-black text-lux-slate tracking-tight">
                        {daysLeft > 0 ? timeLeftStr : "Contrat terminé"}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Échéance finale</p>
                    <p className="text-sm font-bold text-lux-blue">{new Date(endDate).toLocaleDateString('fr-FR')}</p>
                </div>
            </div>

            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-lux-teal to-lux-blue transition-all duration-1000 shadow-lg"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                </div>
            </div>

            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Début: {new Date(startDate).toLocaleDateString('fr-FR')}</span>
                <span>{Math.round(progress)}% écoulé</span>
            </div>
        </div>
    );
};

export default ContractProgress;
