export interface User {
    id: number;
    name: string;
    email: string;
    imageURL: string;
}

export interface CardSet {
    id: number;
    name: string;
    user_id: number;
}