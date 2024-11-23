export interface LoginReq {
    email: string;
    password: string;
}

export interface RegisterReq {
    email: string;
    password: string;
    displayName: string;
}

export interface PreferenceReq {
    preference: string;
    user_id: string;
}

export interface Preference {
    id: number;
    preference: string;
}

export interface PaperCard {
    link: string;
    title: string;
    summary: string;
    starred: boolean;
}
