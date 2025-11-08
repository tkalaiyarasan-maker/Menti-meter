import React, { useState } from 'react';
import { Question } from '../types';

interface ParticipantVoteProps {
  question: Question;
  submitVote: (optionId: string, questionId: string) => void;
}

const ParticipantVote: React.FC<ParticipantVoteProps> = ({ question, submitVote }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleVote = () => {
    if (selectedOption) {
      submitVote(selectedOption, question.id);
    }
  };

  const colors = [
    'bg-sky-500 hover:bg-sky-600',
    'bg-amber-500 hover:bg-amber-600',
    'bg-emerald-500 hover:bg-emerald-600',
    'bg-rose-500 hover:bg-rose-600',
    'bg-indigo-500 hover:bg-indigo-600',
    'bg-pink-500 hover:bg-pink-600'
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          {question.text}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {question.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`p-6 rounded-lg text-white font-bold text-xl transition-all duration-200 transform ${colors[index % colors.length]} ${selectedOption === option.id ? 'ring-4 ring-offset-2 dark:ring-offset-gray-900 ring-white scale-105' : 'hover:scale-105'}`}
            >
              {option.text}
            </button>
          ))}
        </div>
        <button
          onClick={handleVote}
          disabled={!selectedOption}
          className="mt-10 w-full max-w-xs py-4 px-6 bg-primary-600 text-white font-bold rounded-lg shadow-lg text-xl hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
        >
          Submit Vote
        </button>
      </div>
    </div>
  );
};

export default ParticipantVote;
