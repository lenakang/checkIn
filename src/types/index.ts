export interface Member {
    id: string;
    name: string;
    createdAt: number;
    uid: string;
    age?: string;
}

export interface CheckIn {
    date: string;
    members: string[];
}

export interface SetCheckIn {
    date: string;
    memberId: string;
}

export interface ModifyForm {
    name: string;
    age: string;
    formError?: string;
}
