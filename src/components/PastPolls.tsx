import React, { useState } from 'react';
import { PresentationRecord, View, Question } from '../types';
import ResultsChart from './ResultsChart';
import { ArrowLeftIcon } from './icons/Icons';

interface PastPresentationsProps {
  pastPresentations: PresentationRecord[];
  setView: (view: View) => void;
}

const PastPolls: React.FC<PastPresentationsProps> = ({ pastPresentations, setView }) => {
  const [expandedPresentationId, setExpandedPresentationId] = useState<string | null>(null);

  const togglePresentationDetails = (presentationId: string) => {
    setExpandedPresentationId(prevId => (prevId === presentationId ? null : presentationId));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Past Presentations</h1>
        <button 
          onClick={() => setView('ADMIN_DASHBOARD')} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </button>
      </header>

      {pastPresentations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500 dark:text-gray-400">You haven't completed any presentations yet.</p>
          <p className="mt-2 text-gray-400">Create and run a presentation to see its record here.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {pastPresentations.map(({ presentation, votes }) => {
            const isExpanded = expandedPresentationId === presentation.id;

            return (
              <div key={presentation.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => togglePresentationDetails(presentation.id)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none"
                  aria-expanded={isExpanded}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg text-primary-700 dark:text-primary-300">{presentation.title}</p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{presentation.questions.length} question{presentation.questions.length !== 1 ? 's' : ''}</span>
                        <svg className={`w-6 h-6 transform transition-transform text-gray-400 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                  </div>
                </button>
                <div className={`transition-all duration-500 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-6">
                            {presentation.questions.map((question: Question) => {
                                const questionVotes = votes[question.id] || {};
                                const chartData = question.options.map(option => ({
                                    name: option.text,
                                    votes: questionVotes[option.id] || 0,
                                }));
                                return (
                                    <div key={question.id}>
                                        <h3 className="font-semibold text-md mb-2 text-gray-800 dark:text-gray-200">{question.text}</h3>
                                        <div className="h-80 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                                            <ResultsChart data={chartData} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PastPolls;
