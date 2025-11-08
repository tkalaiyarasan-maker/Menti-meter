
export interface PollOption {
  id: string;
  text: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
}

export interface Votes {
  [optionId: string]: number;
}

export interface Participant {
  name: string;
  voted: boolean;
}

export type View =
  | 'HOME'
  | 'ADMIN_LOGIN'
  | 'ADMIN_DASHBOARD'
  | 'PARTICIPANT_JOIN'
  | 'PARTICIPANT_VOTE'
  | 'PARTICIPANT_WAITING'
  | 'PARTICIPANT_VOTED';
