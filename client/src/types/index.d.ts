export interface LoginReq {
    email: string;
    password: string;
}

export interface RegisterReq {
    email: string;
    password: string;
    displayName: string;
}

export interface Preference {
    id: number;
    preference: string;
}

export interface PaperCard {
    id: string;
    link: string;
    title: string;
    summary: string;
    starred: boolean;
}

export interface Message {
    message: string;
    author: string;
}