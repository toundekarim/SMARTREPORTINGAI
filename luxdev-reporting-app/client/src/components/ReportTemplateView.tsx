import React from 'react';
import { Video, Mic, FileText, CheckCircle2, XCircle } from 'lucide-react';

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
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-lux-slate uppercase tracking-tight">Référentiel de Rapport</h4>
                <span className="text-[10px] font-bold text-lux-teal bg-lux-teal/5 px-2 py-0.5 rounded-full">Standard LuxDev</span>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                <h5 className="font-bold text-lux-slate mb-4">{template.title}</h5>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${template.requires_video ? 'bg-white border-lux-teal shadow-sm' : 'bg-slate-100/50 border-slate-200 opacity-50'}`}>
                        <Video size={20} className={template.requires_video ? 'text-lux-teal' : 'text-slate-400'} />
                        <span className="text-[8px] font-black uppercase text-center">Vidéo Demo</span>
                        {template.requires_video ? <CheckCircle2 size={12} className="text-lux-teal" /> : <XCircle size={12} className="text-slate-300" />}
                    </div>

                    <div className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${template.requires_audio ? 'bg-white border-lux-teal shadow-sm' : 'bg-slate-100/50 border-slate-200 opacity-50'}`}>
                        <Mic size={20} className={template.requires_audio ? 'text-lux-teal' : 'text-slate-400'} />
                        <span className="text-[8px] font-black uppercase text-center">Audio Expl.</span>
                        {template.requires_audio ? <CheckCircle2 size={12} className="text-lux-teal" /> : <XCircle size={12} className="text-slate-300" />}
                    </div>

                    <div className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${template.requires_text ? 'bg-white border-lux-teal shadow-sm' : 'bg-slate-100/50 border-slate-200 opacity-50'}`}>
                        <FileText size={20} className={template.requires_text ? 'text-lux-teal' : 'text-slate-400'} />
                        <span className="text-[8px] font-black uppercase text-center">Fichiers</span>
                        {template.requires_text ? <CheckCircle2 size={12} className="text-lux-teal" /> : <XCircle size={12} className="text-slate-300" />}
                    </div>
                </div>

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
            </div>
        </div>
    );
};

export default ReportTemplateView;
