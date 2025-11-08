
import React, { useState, useEffect } from 'react';
import { Poll, Votes, Participant, View } from '../types';
import ResultsChart from './ResultsChart';
import { PlusIcon, TrashIcon, SparklesIcon, ArrowLeftIcon } from './icons/Icons';
import { generatePollFromTopic } from '../services/geminiService';

interface AdminDashboardProps {
  poll: Poll | null;
  votes: Votes;
  participants: Participant[];
  createPoll: (question: string, options: string[]) => void;
  startPoll: () => void;
  resetPoll: () => void;
  setView: (view: View) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ poll, votes, participants, createPoll, startPoll, resetPoll, setView }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (poll) {
      setQuestion(poll.question);
      setOptions(poll.options.map(o => o.text));
    }
  }, [poll]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && options.every(opt => opt.trim())) {
      createPoll(question, options);
    } else {
      alert("Please fill out the question and all options.");
    }
  };

  const handleGeneratePoll = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setError('');
    try {
      const result = await generatePollFromTopic(aiTopic);
      setQuestion(result.question);
      setOptions(result.options);
    } catch (err) {
      setError('Failed to generate poll. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Poll ID copied to clipboard!');
  };

  if (poll) {
    const chartData = poll.options.map(option => ({
      name: option.text,
      votes: votes[option.id] || 0,
    }));

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Admin Dashboard</h1>
           <button onClick={() => setView('HOME')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-2">{poll.question}</h2>
            <div className="h-96">
              <ResultsChart data={chartData} />
            </div>
            {!poll.isActive && (
              <button 
                onClick={startPoll} 
                className="w-full mt-4 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg"
              >
                Start Poll
              </button>
            )}
            {poll.isActive && <p className="text-center mt-4 text-green-500 font-semibold">Poll is live!</p>}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
            <div className="text-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Presentation ID</p>
              <p 
                className="text-3xl font-mono font-bold tracking-widest cursor-pointer" 
                onClick={() => copyToClipboard(poll.id)}
              >
                {poll.id}
              </p>
            </div>
             <div className="flex justify-center space-x-4">
                <button onClick={resetPoll} className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors">Reset Votes</button>
                <button onClick={() => createPoll('', ['',''])} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">New Poll</button>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Participants ({participants.length})</h3>
              <div className="max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                {participants.length > 0 ? participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    {p.voted ? 
                      <span className="text-green-500 font-semibold">Voted</span> : 
                      <span className="text-gray-400">Waiting</span>
                    }
                  </div>
                )) : <p className="text-gray-400 text-center">No participants yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Create a New Poll</h1>
        
        <div className="mb-6 p-4 bg-primary-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <SparklesIcon className="w-6 h-6 text-primary-500" />
            <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-300">Generate with AI</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g., 'Fun facts about space'"
              className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-white"
              disabled={isGenerating}
            />
            <button
              onClick={handleGeneratePoll}
              disabled={isGenerating || !aiTopic.trim()}
              className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is your favorite color?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:text-gray-300 dark:disabled:text-gray-500"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
             <button
              type="button"
              onClick={addOption}
              disabled={options.length >= 6}
              className="mt-2 flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 disabled:text-gray-400 dark:disabled:text-gray-500"
            >
              <PlusIcon className="w-5 h-5" />
              Add Option
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors text-lg"
          >
            Create Poll
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
