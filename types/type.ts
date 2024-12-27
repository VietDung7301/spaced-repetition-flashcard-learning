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
    exampleAI: string | null;
}

export interface QuestionOption {
    word: string;
    meaning: string;
    pronunciation: string | null;
    bg_color: string | null;
    isCorrect: boolean;
}

export interface CardQuestion extends Card {
    options: QuestionOption[];
}

export enum QuestionType {
    WordToMeaningChose,
    MeaningToWordChose,
    MeaningToWordFillBlank
}

export function randomEnum<T>(anEnum: T extends object?object:any): T[keyof T] {
    const enumValues = Object.keys(anEnum)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    const randomIndex = Math.floor(Math.random() * enumValues.length)
    const randomEnumValue = enumValues[randomIndex]
    return randomEnumValue;
  }