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

export interface Card {
    id: number;
    word: string;
    pronunciation: string;
    meaning: string;
    example: string;
    set_id: number;
    repetitions: number;
    interval: number;
    ease_factor: number;
    next_study_time: Date;
}

export interface CardQuestion extends Card {
    questions: {
        word: string;
        meaning: string;
        pronunciation: string;
    }[];
}