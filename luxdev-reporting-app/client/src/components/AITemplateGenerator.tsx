import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Save, Download, FileText, Table } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface Props {
    partnerId: number;
    onTemplateApplied: () => void;
}

const AITemplateGenerator: React.FC<Props> = ({ partnerId, onTemplateApplied }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedTemplate, setGeneratedTemplate] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:3000/api/ai/generate-template', { prompt });
            setGeneratedTemplate(res.data);
        } catch (err) {
            console.error("AI Generation Error", err);
            setError("L'IA est momentanément indisponible. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const downloadAsPDF = () => {
        if (!generatedTemplate) return;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.setTextColor(0, 51, 102); // LuxDev Blue
        doc.text("MODELE DE RAPPORT LUXDEV", 20, 25);

        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text(generatedTemplate.title, 20, 35);

        doc.line(20, 38, 190, 38);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("INSTRUCTIONS :", 20, 50);
        doc.setFont("helvetica", "normal");
        const splitInstructions = doc.splitTextToSize(generatedTemplate.instructions, 170);
        doc.text(splitInstructions, 20, 55);

        let yPos = 75;
        doc.setFont("helvetica", "bold");
        doc.text("STRUCTURE DU RAPPORT À SUIVRE :", 20, yPos);
        yPos += 10;

        if (generatedTemplate.structure) {
            generatedTemplate.structure.forEach((item: any, idx: number) => {
                if (yPos > 260) { doc.addPage(); yPos = 20; }

                doc.setFont("helvetica", "bold");
                doc.setTextColor(0, 51, 102);
                doc.text(`${idx + 1}. ${item.section.toUpperCase()}`, 20, yPos);
                yPos += 7;

                doc.setFont("helvetica", "italic");
                doc.setTextColor(100, 100, 100);
                const splitDetails = doc.splitTextToSize(`Note: ${item.details}`, 160);
                doc.text(splitDetails, 25, yPos);
                yPos += (splitDetails.length * 5) + 5;

                doc.setFont("helvetica", "normal");
                doc.setTextColor(200, 200, 200);
                doc.text("[Saisissez votre contenu ici...]", 25, yPos);
                yPos += 15;
            });
        }

        doc.save(`Modele_${generatedTemplate.title.replace(/\s+/g, '_')}.pdf`);
    };

    const downloadAsWord = async () => {
        if (!generatedTemplate) return;

        const sections = generatedTemplate.structure ? generatedTemplate.structure.flatMap((item: any, idx: number) => [
            new Paragraph({
                text: `${idx + 1}. ${item.section.toUpperCase()}`,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "Saisir ici : ", bold: true, color: "666666" }),
                    new TextRun({ text: item.details, italics: true, color: "888888" })
                ],
                spacing: { after: 200 }
            }),
            new Paragraph({
                text: "____________________________________________________________________________________",
                spacing: { after: 400 }
            })
        ]) : [];

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "MODÈLE DE RAPPORT LUXDEV",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({
                        text: generatedTemplate.title,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "INSTRUCTIONS GÉNÉRALES : ", bold: true }),
                            new TextRun(generatedTemplate.instructions)
                        ],
                        spacing: { after: 600 }
                    }),
                    ...sections
                ],
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Modele_${generatedTemplate.title.replace(/\s+/g, '_')}.docx`);
    };

    const downloadAsExcel = () => {
        if (!generatedTemplate) return;

        const data = [
            ["MODÈLE DE RAPPORT LUXDEV", ""],
            ["Titre du Rapport", generatedTemplate.title],
            ["Instructions Générales", generatedTemplate.instructions],
            ["", ""],
            ["SECTION", "INSTRUCTIONS DE REMPLISSAGE", "VOTRE CONTENU"],
            ...(generatedTemplate.structure || []).map((item: any) => [
                item.section,
                item.details,
                ""
            ])
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);

        // Style simple
        ws['!cols'] = [{ wch: 30 }, { wch: 50 }, { wch: 60 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Structure Rapport");
        XLSX.writeFile(wb, `Modele_${generatedTemplate.title.replace(/\s+/g, '_')}.xlsx`);
    };

    const handleApply = async () => {
        if (!generatedTemplate) return;
        try {
            console.log("Applying template to partner", partnerId, generatedTemplate);

            await axios.post('http://localhost:3000/api/templates', {
                partner_id: partnerId,
                title: generatedTemplate.title,
                instructions: generatedTemplate.instructions,
                structure: generatedTemplate.structure,
                requires_video: generatedTemplate.requires_video,
                requires_audio: generatedTemplate.requires_audio,
                requires_text: generatedTemplate.requires_text,
                text_formats: generatedTemplate.text_formats
            });

            onTemplateApplied();
            setGeneratedTemplate(null);
            setPrompt('');
        } catch (err) {
            console.error("Error saving template", err);
            setError("Erreur lors de la sauvegarde du modèle.");
        }
    };

    return (
        <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-lux-blue/5 to-white border-lux-blue/10">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-lux-blue text-white rounded-xl shadow-lg shadow-lux-blue/20">
                    <Sparkles size={18} />
                </div>
                <div>
                    <h3 className="font-black text-lux-slate uppercase tracking-tight text-xs">Générateur de Template IA</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
                </div>
            </div>

            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Décrivez votre besoin (ex: Suivi d'un projet de forage d'eau potable au Bénin...)"
                    className="w-full h-24 p-4 bg-white border border-slate-100 rounded-2xl text-xs font-medium focus:border-lux-blue focus:ring-4 focus:ring-lux-blue/5 transition-all outline-none resize-none"
                    disabled={loading}
                />

                <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${loading ? 'bg-slate-100 text-slate-400' : 'bg-lux-blue text-white shadow-xl shadow-lux-blue/10 hover:scale-[1.02]'}`}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            L'IA réfléchit...
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            Générer le modèle
                        </>
                    )}
                </button>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 p-3 bg-red-50 text-red-500 rounded-xl flex items-center gap-2 text-[10px] font-bold"
                    >
                        <AlertCircle size={14} />
                        {error}
                    </motion.div>
                )}

                {generatedTemplate && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 p-6 bg-white border border-lux-blue/20 rounded-3xl shadow-sm relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-3">
                            <CheckCircle2 size={16} className="text-lux-blue opacity-20" />
                        </div>

                        <h4 className="text-xs font-black text-lux-slate uppercase mb-3 text-lux-blue">{generatedTemplate.title}</h4>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Instructions générées</p>
                                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                    {generatedTemplate.instructions}
                                </p>
                            </div>

                            {generatedTemplate.structure && (
                                <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 mb-2">Formulation du rapport (Plan)</p>
                                    <div className="space-y-2">
                                        {generatedTemplate.structure.map((item: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                <p className="text-[10px] font-black text-lux-blue uppercase mb-1">{idx + 1}. {item.section}</p>
                                                <p className="text-[9px] text-slate-500 font-medium">{item.details}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={downloadAsPDF}
                                    className="flex flex-col items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-all text-center group"
                                >
                                    <Download size={14} />
                                    <span className="text-[8px] font-black uppercase">PDF</span>
                                </button>
                                <button
                                    onClick={downloadAsWord}
                                    className="flex flex-col items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all text-center group"
                                >
                                    <FileText size={14} />
                                    <span className="text-[8px] font-black uppercase">Word</span>
                                </button>
                                <button
                                    onClick={downloadAsExcel}
                                    className="flex flex-col items-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all text-center group"
                                >
                                    <Table size={14} />
                                    <span className="text-[8px] font-black uppercase">Excel</span>
                                </button>
                            </div>

                            <button
                                onClick={handleApply}
                                className="w-full py-3 bg-lux-teal text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-lux-slate hover:scale-[1.02] transition-all shadow-lg shadow-lux-teal/10"
                            >
                                <Save size={16} />
                                Appliquer au partenaire
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AITemplateGenerator;
