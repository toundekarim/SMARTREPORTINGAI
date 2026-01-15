import React from 'react';
import { motion } from 'framer-motion';

interface EvolutionPoint {
    date: string;
    expected: number;
    actual: number;
}

interface Props {
    data: EvolutionPoint[];
}

const ProjectEvolutionChart: React.FC<Props> = ({ data }) => {
    if (!data || data.length < 2) {
        return (
            <div className="flex items-center justify-center h-[150px] bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Données insuffisantes pour le graphe</p>
            </div>
        );
    }

    const width = 500;
    const height = 180;
    const paddingX = 40;
    const paddingY = 30;
    const maxProg = 100;

    const getPoints = (key: 'expected' | 'actual') => data.map((d, i) => ({
        x: paddingX + (i * (width - 2 * paddingX)) / (data.length - 1),
        y: height - paddingY - (d[key] * (height - 2 * paddingY)) / maxProg
    }));

    const pointsActual = getPoints('actual');
    const pointsExpected = getPoints('expected');

    const createPath = (pts: { x: number, y: number }[]) => {
        return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    };

    const pathActual = createPath(pointsActual);
    const pathExpected = createPath(pointsExpected);

    // Area path for Actual
    const areaActual = `${pathActual} L ${pointsActual[pointsActual.length - 1].x} ${height - paddingY} L ${pointsActual[0].x} ${height - paddingY} Z`;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Attendu</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-lux-blue shadow-lg shadow-lux-blue/20"></span>
                        <p className="text-[10px] font-black uppercase text-lux-slate tracking-widest">Réel</p>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-lux-teal bg-lux-teal/10 px-2 py-0.5 rounded-full">Automatique</span>
            </div>

            <div className="relative bg-white/50 backdrop-blur-sm rounded-[2rem] p-6 border border-slate-100 shadow-inner">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,74,153,0.05))' }}>
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#004A99" />
                            <stop offset="100%" stopColor="#00A19D" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#004A99" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#004A99" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 50, 100].map(val => (
                        <line
                            key={val}
                            x1={paddingX}
                            y1={height - paddingY - (val * (height - 2 * paddingY)) / 100}
                            x2={width - paddingX}
                            y2={height - paddingY - (val * (height - 2 * paddingY)) / 100}
                            stroke="#F1F5F9"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Area under Actual curve */}
                    <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        d={areaActual}
                        fill="url(#areaGradient)"
                    />

                    {/* Expected Path (Dashed) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        d={pathExpected}
                        fill="none"
                        stroke="#CBD5E1"
                        strokeWidth="4"
                        strokeDasharray="8 8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Actual Path (Solid) */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        d={pathActual}
                        fill="none"
                        stroke="url(#chartGradient)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Points (Actual only for cleanliness, or both?) - Let's do Actual */}
                    {pointsActual.map((p, i) => (
                        <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.1 }}>
                            <circle cx={p.x} cy={p.y} r="6" fill="white" stroke={i === pointsActual.length - 1 ? '#00A19D' : '#004A99'} strokeWidth="3" />
                            {i % 2 === 0 && (
                                <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[10px] font-black fill-lux-slate">
                                    {data[i].actual}%
                                </text>
                            )}
                        </motion.g>
                    ))}
                </svg>

                {/* X-Axis Dates */}
                <div className="flex justify-between mt-6 px-6">
                    {data.map((d, i) => (
                        <span key={i} className={`text-[8px] font-black uppercase tracking-tighter ${i === 0 || i === data.length - 1 ? 'text-lux-slate' : 'text-slate-300'}`}>
                            {d.date}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectEvolutionChart;
