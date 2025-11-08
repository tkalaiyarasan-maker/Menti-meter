export interface PollOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: PollOption[];
}

export interface Presentation {
  id: string;
  title: string;
  questions: Question[];
  currentQuestionIndex: number;
  isActive: boolean;
}

export interface AllVotes {
  [questionId: string]: {
    [optionId: string]: number;
  };
}

export interface Participant {
  name: string;
  votedOn: string[]; // array of question IDs
}

export interface PresentationRecord {
  presentation: Presentation;
  votes: AllVotes;
}

export type View =
  | 'HOME'
  | 'ADMIN_LOGIN'
  | 'ADMIN_DASHBOARD'
  | 'ADMIN_PAST_POLLS'
  | 'PARTICIPANT_JOIN'
  | 'PARTICIPANT_VOTE'
  | 'PARTICIPANT_WAITING'
  | 'PARTICIPANT_VOTED';
