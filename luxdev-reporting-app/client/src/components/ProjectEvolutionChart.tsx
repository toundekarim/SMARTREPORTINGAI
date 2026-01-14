import React from 'react';
import { motion } from 'framer-motion';

interface EvolutionPoint {
    date: string;
    prog: number;
}

interface Props {
    data: EvolutionPoint[];
}

const ProjectEvolutionChart: React.FC<Props> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const width = 400;
    const height = 150;
    const padding = 20;

    // Calculate scaling
    const maxProg = 100;
    const points = data.map((d, i) => ({
        x: padding + (i * (width - 2 * padding)) / (data.length - 1 || 1),
        y: height - padding - (d.prog * (height - 2 * padding)) / maxProg
    }));

    // Create SVG path
    const pathD = points.length > 0
        ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
        : '';

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Évolution de la progression</p>
                <div className="flex gap-2">
                    <span className="w-2 h-2 rounded-full bg-lux-teal"></span>
                    <span className="text-[10px] font-bold text-lux-slate">Historique</span>
                </div>
            </div>

            <div className="relative bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map(val => (
                        <line
                            key={val}
                            x1={padding}
                            y1={height - padding - (val * (height - 2 * padding)) / 100}
                            x2={width - padding}
                            y2={height - padding - (val * (height - 2 * padding)) / 100}
                            stroke="#E2E8F0"
                            strokeWidth="1"
                            strokeDasharray="4"
                        />
                    ))}

                    {/* The Path */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        d={pathD}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {points.map((p, i) => (
                        <motion.circle
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            fill="#00A19D"
                            stroke="white"
                            strokeWidth="2"
                            className="shadow-sm"
                        />
                    ))}

                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#004A99" />
                            <stop offset="100%" stopColor="#00A19D" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between mt-2 px-2">
                    {data.map((d, i) => (
                        <span key={i} className="text-[8px] font-black text-slate-400 uppercase">
                            {d.date}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectEvolutionChart;
