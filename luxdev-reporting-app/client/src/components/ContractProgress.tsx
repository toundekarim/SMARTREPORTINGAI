import React from 'react';
import { differenceInDays, intervalToDuration } from 'date-fns';


interface Props {
    startDate: string;
    endDate: string;
}

const ContractProgress: React.FC<Props> = ({ startDate, endDate }) => {
    if (!startDate || !endDate) {
        return (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dates de contrat non définies</p>
            </div>
        );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return (
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Format de date invalide</p>
            </div>
        );
    }

    // Reset usage of time to avoid discrepancies
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const totalDays = differenceInDays(end, start);
    const daysPassed = differenceInDays(today, start);
    const daysLeft = differenceInDays(end, today);

    // Clamp progress between 0 and 100
    const progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

    // Calculate precise remaining time
    let timeLeftStr = "Contrat terminé";
    if (daysLeft > 0) {
        const duration = intervalToDuration({
            start: today,
            end: end
        });

        const parts = [];
        if (duration.years && duration.years > 0) parts.push(`${duration.years} an${duration.years > 1 ? 's' : ''}`);
        if (duration.months && duration.months > 0) parts.push(`${duration.months} mois`);
        if (duration.days && duration.days > 0) parts.push(`${duration.days} jour${duration.days > 1 ? 's' : ''}`);

        if (parts.length === 0) {
            timeLeftStr = "Aujourd'hui"; // less than a day (should trigger days>0 check though, but just in case)
        } else {
            timeLeftStr = parts.join(', ');
        }
    } else if (differenceInDays(today, start) < 0) {
        timeLeftStr = "Pas encore commencé";
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Temps de contrat restant</p>
                    <p className="text-xl font-black text-lux-slate tracking-tight truncate max-w-[200px]" title={timeLeftStr}>
                        {timeLeftStr}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Échéance finale</p>
                    <p className="text-sm font-bold text-lux-blue">{end.toLocaleDateString('fr-FR')}</p>
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
                <span>Début: {start.toLocaleDateString('fr-FR')}</span>
                <span>{Math.round(progress)}% écoulé</span>
            </div>
        </div>
    );
};

export default ContractProgress;
