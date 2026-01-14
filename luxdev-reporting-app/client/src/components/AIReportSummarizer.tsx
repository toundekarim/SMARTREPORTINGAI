import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Sparkles, Loader2, FileText, Upload, AlertCircle, CheckCircle2, List, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const AIReportSummarizer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const downloadSummaryPDF = () => {
        if (!summary) return;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(17, 94, 89); // LuxDev Teal
        doc.text("Résumé du Rapport IA", 20, 20);

        doc.setFontSize(14);
        doc.setTextColor(51, 65, 85);
        doc.text("Synthèse Executive", 20, 40);
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(summary.summary, 170);
        doc.text(splitText, 20, 50);

        let y = 50 + (splitText.length * 5) + 10;

        doc.setFontSize(12);
        doc.text("Points Clés :", 20, y);
        y += 7;
        // Assuming summary.key_points exists or adapting to achievements/risks if not
        const pointsToDisplay = summary.achievements && summary.achievements.length > 0 ? summary.achievements : summary.risks;
        if (pointsToDisplay) {
            pointsToDisplay.forEach((p: string) => {
                doc.text(`• ${p}`, 25, y);
                y += 5;
            });
        }

        doc.save(`Resume_Rapport_${new Date().getTime()}.pdf`);
    };

    const downloadSummaryWord = () => {
        if (!summary) return;
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "Résumé Analytique du Rapport", heading: HeadingLevel.HEADING_1 }),
                    new Paragraph({ text: "\nSynthèse Executive", heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: summary.summary }),
                    new Paragraph({ text: "\nRéalisations Clés", heading: HeadingLevel.HEADING_2 }),
                    ...(summary.achievements ? summary.achievements.map((a: string) => new Paragraph({ text: `• ${a}`, bullet: { level: 0 } })) : []),
                    new Paragraph({ text: "\nRisques et Vigilance", heading: HeadingLevel.HEADING_2 }),
                    ...(summary.risks ? summary.risks.map((r: string) => new Paragraph({ text: `• ${r}`, bullet: { level: 0 } })) : []),
                    new Paragraph({ text: "\nRecommandations", heading: HeadingLevel.HEADING_2 }),
                    ...(summary.recommendations ? summary.recommendations.map((rec: string) => new Paragraph({ text: `• ${rec}`, bullet: { level: 0 } })) : []),
                ]
            }]
        });

        Packer.toBlob(doc).then(blob => saveAs(blob, "Resume_IA.docx"));
    };

    const downloadSummaryExcel = () => {
        if (!summary) return;
        const data = [
            ["Section", "Contenu"],
            ["Synthèse", summary.summary],
            ["Réalisations", summary.achievements ? summary.achievements.join(" | ") : ""],
            ["Risques", summary.risks ? summary.risks.join(" | ") : ""],
            ["Recommandations", summary.recommendations ? summary.recommendations.join(" | ") : ""]
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Résumé");
        XLSX.writeFile(wb, "Analyse_Rapport.xlsx");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setSummary(null);
            setError(null);
        }
    };

    const handleSummarize = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('report', file);

        try {
            const res = await axios.post('http://localhost:3000/api/ai/summarize', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSummary(res.data);
        } catch (err: any) {
            console.error("Summarization Error", err);
            const msg = err.response?.data?.error || err.message || "Erreur inconnue";
            setError(`L'analyse a échoué : ${msg}. Vérifiez le format (PDF, Word, Texte).`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-lux-teal/5 to-white border-lux-teal/10">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-lux-teal text-white rounded-xl shadow-lg shadow-lux-teal/20">
                    <Zap size={18} />
                </div>
                <div>
                    <h3 className="font-black text-lux-slate uppercase tracking-tight text-xs">Analyseur de Rapport IA</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Résumé instantané par Gemini</p>
                </div>
            </div>

            <div className="space-y-6">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${file ? 'border-lux-teal bg-lux-teal/5' : 'border-slate-100 hover:border-lux-teal/40 bg-slate-50/50'}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt"
                    />

                    {file ? (
                        <>
                            <div className="w-16 h-16 bg-lux-teal text-white rounded-2xl flex items-center justify-center shadow-xl">
                                <FileText size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-lux-slate truncate max-w-[200px]">{file.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ready for analysis</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-white text-slate-300 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                                <Upload size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-lux-slate uppercase tracking-wider">Cliquez pour uploader votre rapport</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">Formats acceptés : PDF, Word, Texte</p>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={handleSummarize}
                    disabled={loading || !file}
                    className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${loading ? 'bg-slate-100 text-slate-400' : 'bg-lux-teal text-white shadow-xl shadow-lux-teal/20 hover:scale-[1.02]'}`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Analyse en cours...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            Générer le résumé
                        </>
                    )}
                </button>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-red-50 text-red-500 rounded-2xl flex items-center gap-2 text-[10px] font-bold"
                    >
                        <AlertCircle size={14} />
                        {error}
                    </motion.div>
                )}

                {summary && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 space-y-6"
                    >
                        <div className="p-6 bg-white border border-lux-teal/20 rounded-3xl shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-lux-teal mb-2 justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={18} />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Synthèse Executive</h4>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={downloadSummaryPDF}
                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all title='Télécharger PDF'"
                                    >
                                        <FileText size={14} />
                                    </button>
                                    <button
                                        onClick={downloadSummaryWord}
                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all title='Télécharger Word'"
                                    >
                                        <FileText size={14} />
                                    </button>
                                    <button
                                        onClick={downloadSummaryExcel}
                                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all title='Télécharger Excel'"
                                    >
                                        <FileText size={14} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                                {summary.summary}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-lux-blue">
                                        <CheckCircle2 size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Réalisations</span>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {summary.achievements?.map((item: string, i: number) => (
                                            <li key={i} className="text-[11px] text-slate-500 flex items-start gap-2">
                                                <span className="w-1 h-1 bg-lux-blue rounded-full mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <AlertCircle size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Points à surveiller</span>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {summary.risks?.map((item: string, i: number) => (
                                            <li key={i} className="text-[11px] text-slate-500 flex items-start gap-2">
                                                <span className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-emerald-500 mb-3">
                                    <List size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Recommandations</span>
                                </div>
                                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    {summary.recommendations?.map((item: string, i: number) => (
                                        <p key={i} className="text-[11px] text-emerald-700 font-medium italic mb-1 px-2 line-clamp-2">
                                            "{item}"
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIReportSummarizer;
