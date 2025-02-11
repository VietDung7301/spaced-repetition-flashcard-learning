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

export interface VocabCard {
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

export interface GrammarCard {
    id: number;
    grammar: string;
    structure: string;
    meaning: string;
    example: string;
    set_id: number;
    repetitions: number;
    interval: number;
    ease_factor: number;
    next_study_time: Date;
    exampleAI: string | null;
}

export interface KanjiCard {
    id: number;
    kanji: string;
    pronunciation: string;
    meaning: string;
    how_to_remember: string;
    example: string;
    set_id: number;
    repetitions: number;
    interval: number;
    ease_factor: number;
    next_study_time: Date;
    exampleAI: string | null;
}


export interface CardList {
    type: SetType;
    cards: VocabCard[] | GrammarCard[] | KanjiCard[];
}

export interface VocabQuestionOption {
    word: string;
    meaning: string;
    pronunciation: string | null;
    bg_color: {} | null;
    isCorrect: boolean;
}

export interface GrammarQuestionOption {
    grammar: string;
    meaning: string;
    bg_color: {} | null;
    isCorrect: boolean;
}


export interface VocabCardQuestion extends VocabCard {
    options: VocabQuestionOption[];
}

export interface GrammarCardQuestion extends VocabCard {
    options: GrammarQuestionOption[];
}

export enum VocabularyQuestionType {
    WordToMeaningChose,
    MeaningToWordChose,
    MeaningToWordFillBlank
}

export enum GrammarQuestionType {
    WordToMeaning,
    MeaningToWord
}

export function randomEnum<T>(anEnum: T extends object?object:any): T[keyof T] {
    const enumValues = Object.keys(anEnum)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    const randomIndex = Math.floor(Math.random() * enumValues.length)
    const randomEnumValue = enumValues[randomIndex]
    return randomEnumValue;
  }

export enum SetType {
    kanji,
    vocabulary,
    grammar
}
