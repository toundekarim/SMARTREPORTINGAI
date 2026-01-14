import React, { useRef, useState } from 'react';
import { Video, Mic, FileText, CheckCircle2, Upload, Paperclip, Trash2, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Template {
    id: number;
    title: string;
    requires_video: boolean;
    requires_audio: boolean;
    requires_text: boolean;
    text_formats: string;
    instructions: string;
}

interface Props {
    template: Template;
}

const ReportTemplateView: React.FC<Props> = ({ template }) => {
    const videoInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const financialInputRef = useRef<HTMLInputElement>(null);
    const narrativeInputRef = useRef<HTMLInputElement>(null);

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        video: null,
        audio: null,
        financial: null,
        narrative: null
    });

    const [showFileTypeChoice, setShowFileTypeChoice] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFileChange = (type: 'video' | 'audio' | 'financial' | 'narrative', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFiles(prev => ({ ...prev, [type]: file }));
        if (type === 'financial' || type === 'narrative') {
            setShowFileTypeChoice(false);
        }
    };

    const removeFile = (type: string) => {
        setFiles(prev => ({ ...prev, [type]: null }));
    };

    const triggerUpload = (type: 'video' | 'audio' | 'text') => {
        if (isSubmitted) return;
        if (type === 'video' && template.requires_video) videoInputRef.current?.click();
        if (type === 'audio' && template.requires_audio) audioInputRef.current?.click();
        if (type === 'text' && template.requires_text) {
            setShowFileTypeChoice(!showFileTypeChoice);
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulation d'envoi réseau
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            // On pourrait réinitialiser après un certain temps
            setTimeout(() => setIsSubmitted(false), 5000);
        }, 2000);
    };

    const hasAnyFile = files.video || files.audio || files.financial || files.narrative;

    return (
        <div className="space-y-6 relative">
            <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={(e) => handleFileChange('video', e)} />
            <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={(e) => handleFileChange('audio', e)} />
            <input type="file" ref={financialInputRef} accept=".pdf,.xls,.xlsx" className="hidden" onChange={(e) => handleFileChange('financial', e)} />
            <input type="file" ref={narrativeInputRef} accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => handleFileChange('narrative', e)} />

            <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-lux-slate uppercase tracking-tight">Référentiel de Rapport</h4>
                <span className="text-[10px] font-bold text-lux-teal bg-lux-teal/5 px-2 py-0.5 rounded-full">Standard LuxDev</span>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl relative overflow-hidden text-left">
                <h5 className="font-bold text-lux-slate mb-4">{template.title}</h5>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {/* Video Card */}
                    <div
                        onClick={() => triggerUpload('video')}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer relative group ${files.video ? 'bg-emerald-50 border-emerald-500 shadow-sm' : template.requires_video ? 'bg-white border-lux-teal shadow-sm hover:border-lux-blue' : 'bg-slate-100/50 border-slate-200 opacity-50 cursor-not-allowed'}`}
                    >
                        <div className="absolute -top-2 -right-2 transform transition-transform group-hover:scale-110">
                            {files.video ? <CheckCircle2 size={16} className="text-emerald-500 bg-white rounded-full shadow-sm" /> : template.requires_video ? <Upload size={14} className="text-lux-teal animate-bounce" /> : null}
                        </div>
                        <Video size={20} className={files.video ? 'text-emerald-500' : template.requires_video ? 'text-lux-teal' : 'text-slate-400'} />
                        <span className="text-[8px] font-black uppercase text-center">{files.video ? 'Vidéo prête' : 'Vidéo Demo'}</span>
                    </div>

                    {/* Audio Card */}
                    <div
                        onClick={() => triggerUpload('audio')}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer relative group ${files.audio ? 'bg-emerald-50 border-emerald-500 shadow-sm' : template.requires_audio ? 'bg-white border-lux-teal shadow-sm hover:border-lux-blue' : 'bg-slate-100/50 border-slate-200 opacity-50 cursor-not-allowed'}`}
                    >
                        <div className="absolute -top-2 -right-2 transform transition-transform group-hover:scale-110">
                            {files.audio ? <CheckCircle2 size={16} className="text-emerald-500 bg-white rounded-full shadow-sm" /> : template.requires_audio ? <Upload size={14} className="text-lux-teal animate-bounce" /> : null}
                        </div>
                        <Mic size={20} className={files.audio ? 'text-emerald-500' : template.requires_audio ? 'text-lux-teal' : 'text-slate-400'} />
                        <span className="text-[8px] font-black uppercase text-center">{files.audio ? 'Audio chargé' : 'Audio Expl.'}</span>
                    </div>

                    {/* Text Card with Menu Trigger */}
                    <div
                        onClick={() => triggerUpload('text')}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer relative group ${(files.financial || files.narrative) ? 'bg-emerald-50 border-emerald-500 shadow-sm' : template.requires_text ? 'bg-white border-lux-teal shadow-sm hover:border-lux-blue' : 'bg-slate-100/50 border-slate-200 opacity-50 cursor-not-allowed'}`}
                    >
                        <div className="absolute -top-2 -right-2 transform transition-transform group-hover:scale-110">
                            {(files.financial || files.narrative) ? <CheckCircle2 size={16} className="text-emerald-500 bg-white rounded-full shadow-sm" /> : template.requires_text ? <Upload size={14} className="text-lux-teal animate-bounce" /> : null}
                        </div>
                        <FileText size={20} className={(files.financial || files.narrative) ? 'text-emerald-500' : template.requires_text ? 'text-lux-teal' : 'text-slate-400'} />
                        <span className="text-[8px] font-black uppercase text-center">Fichiers</span>
                    </div>
                </div>

                <AnimatePresence>
                    {showFileTypeChoice && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"
                        >
                            <p className="text-sm font-black text-lux-slate uppercase mb-6 tracking-tight">Sélectionnez le type de rapport</p>
                            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                <button
                                    onClick={() => financialInputRef.current?.click()}
                                    className="p-4 glass border-2 border-slate-100 rounded-2xl flex flex-col items-center gap-3 hover:border-lux-teal hover:scale-105 transition-all group"
                                >
                                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase leading-tight">Rapport Financier</span>
                                </button>
                                <button
                                    onClick={() => narrativeInputRef.current?.click()}
                                    className="p-4 glass border-2 border-slate-100 rounded-2xl flex flex-col items-center gap-3 hover:border-lux-blue hover:scale-105 transition-all group"
                                >
                                    <div className="p-2 bg-lux-blue/10 text-lux-blue rounded-xl group-hover:bg-lux-blue group-hover:text-white transition-all">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase leading-tight">Rapport Narratif</span>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowFileTypeChoice(false)}
                                className="mt-6 text-[10px] font-bold text-slate-400 uppercase hover:text-lux-slate transition-colors"
                            >
                                Annuler
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isSubmitted && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-lux-teal/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center text-white"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4"
                            >
                                <Check size={32} strokeWidth={4} />
                            </motion.div>
                            <h2 className="text-xl font-black uppercase tracking-tight mb-2">Rapport Envoyé !</h2>
                            <p className="text-sm font-medium opacity-80">LuxDev a bien reçu votre soumission.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Selected Files List */}
                <AnimatePresence>
                    {hasAnyFile && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-white/50 border border-slate-100 rounded-2xl space-y-3"
                        >
                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1 text-left">Pièces jointes sélectionnées</p>

                            {[
                                { key: 'video', label: 'Vidéo', color: 'text-emerald-500' },
                                { key: 'audio', label: 'Audio', color: 'text-emerald-500' },
                                { key: 'financial', label: 'Financier', color: 'text-amber-500' },
                                { key: 'narrative', label: 'Narratif', color: 'text-lux-blue' }
                            ].map((item) => files[item.key] && (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={item.key}
                                    className="flex items-center justify-between bg-white p-2 px-3 rounded-xl border border-slate-100 shadow-sm group"
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-lux-slate overflow-hidden">
                                        <Paperclip size={10} className={item.color} />
                                        <span className={`text-[8px] uppercase ${item.color} shrink-0`}>{item.label}:</span>
                                        <span className="truncate">{files[item.key]!.name}</span>
                                    </div>
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => removeFile(item.key)}
                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-400">Instructions Partenaires</p>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        {template.instructions}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-lux-blue font-bold">
                        <FileText size={12} />
                        Formats acceptés : {template.text_formats}
                    </div>
                </div>

                {/* Submit Button */}
                {hasAnyFile && !isSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-6"
                    >
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${isSubmitting ? 'bg-slate-100 text-slate-400 scale-95' : 'bg-lux-teal text-white shadow-lux-teal/20 hover:scale-[1.02] hover:bg-lux-blue'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Envoyer le rapport à LuxDev
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ReportTemplateView;
