export interface User {
    id: number;
    email: string;
    role: 'admin' | 'partner';
    name: string;
    partner_id?: number;
}

export interface Partner {
    id: number;
    name: string;
    contact_email: string;
    logo_url?: string;
    contract_start_date: string;
    contract_end_date: string;
    description: string;
    meeting_frequency?: 'aucune' | 'hebdomadaire' | 'mensuelle' | 'annuelle';
    active_projects?: number;
    country?: string;
}

export interface Project {
    id: number;
    partner_id: number;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'paused';
    created_at: string;
}

export interface Report {
    id: number;
    project_id: number;
    partner_id?: number;
    partner_name?: string;
    project_title?: string;
    title: string;
    submission_date: string;
    reviewer?: string;
    status: 'en attente' | 'validé' | 'brouillon' | 'late';
    file_path?: string;
}

export interface CalendarEvent {
    id: number;
    partner_id: number;
    partner_name?: string;
    title: string;
    event_date: string;
    type: 'meeting' | 'deadline' | 'other';
    description?: string;
}

export interface Template {
    id: number;
    partner_id: number;
    partner_name?: string;
    title: string;
    requires_video: boolean;
    requires_audio: boolean;
    requires_text: boolean;
    text_formats: string;
    instructions: string;
    created_at: string;
}
