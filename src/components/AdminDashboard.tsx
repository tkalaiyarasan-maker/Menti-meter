import React, { useState, useEffect } from 'react';
import { Presentation, AllVotes, Participant, View, Question } from '../types';
import ResultsChart from './ResultsChart';
import { PlusIcon, TrashIcon, SparklesIcon, ArrowLeftIcon, ArchiveBoxIcon, ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';
import { generatePresentationFromTopic } from '../services/geminiService';

interface AdminDashboardProps {
  presentation: Presentation | null;
  allVotes: AllVotes;
  participants: Participant[];
  createPresentation: (title: string, questions: { question: string, options: string[] }[]) => void;
  startPresentation: () => void;
  resetPresentation: () => void;
  setView: (view: View) => void;
  startNewPresentation: () => void;
  pastPollsCount: number;
  nextQuestion: () => void;
  previousQuestion: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ presentation, allVotes, participants, createPresentation, startPresentation, resetPresentation, setView, startNewPresentation, pastPollsCount, nextQuestion, previousQuestion }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<{ question: string; options: string[] }[]>([{ question: '', options: ['', ''] }]);
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleQuestionChange = (qIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length < 6) {
      newQuestions[qIndex].options.push('');
      setQuestions(newQuestions);
    }
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options.length > 2) {
      newQuestions[qIndex].options.splice(oIndex, 1);
      setQuestions(newQuestions);
    }
  };
  
  const addQuestion = () => {
      setQuestions([...questions, { question: '', options: ['', ''] }]);
  };

  const removeQuestion = (qIndex: number) => {
      if(questions.length > 1) {
          setQuestions(questions.filter((_, index) => index !== qIndex));
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = title.trim() && questions.every(q => q.question.trim() && q.options.every(opt => opt.trim()));
    if (isValid) {
      createPresentation(title, questions);
    } else {
      alert("Please fill out the title, all questions, and all options.");
    }
  };

  const handleGeneratePoll = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setError('');
    try {
      const result = await generatePresentationFromTopic(aiTopic);
      setTitle(result.title);
      setQuestions(result.questions);
    } catch (err) {
      setError('Failed to generate presentation. Please check your API key and try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Presentation ID copied to clipboard!');
  };

  if (presentation) {
    const currentQuestion = presentation.questions[presentation.currentQuestionIndex];
    const currentVotes = allVotes[currentQuestion.id] || {};
    const chartData = currentQuestion.options.map(option => ({
      name: option.text,
      votes: currentVotes[option.id] || 0,
    }));

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Admin Dashboard</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">{presentation.title}</p>
          </div>
           <div className="flex items-center gap-2">
            {pastPollsCount > 0 && (
              <button onClick={() => setView('ADMIN_PAST_POLLS')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <ArchiveBoxIcon className="w-4 h-4" />
                  Past Presentations ({pastPollsCount})
              </button>
            )}
            <button onClick={() => setView('HOME')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
              Home
            </button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold">{currentQuestion.text}</h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Question {presentation.currentQuestionIndex + 1} of {presentation.questions.length}
                </p>
            </div>
            <div className="h-96">
              <ResultsChart data={chartData} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
                <button onClick={previousQuestion} disabled={presentation.currentQuestionIndex === 0} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"><ChevronLeftIcon className="w-6 h-6"/></button>
                {!presentation.isActive ? (
                  <button onClick={startPresentation} className="flex-grow py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg">
                    Start Presentation
                  </button>
                ) : <p className="text-center text-green-500 font-semibold">Presentation is live!</p>}
                <button onClick={nextQuestion} disabled={presentation.currentQuestionIndex === presentation.questions.length - 1} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"><ChevronRightIcon className="w-6 h-6"/></button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
            <div className="text-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Presentation ID</p>
              <p className="text-3xl font-mono font-bold tracking-widest cursor-pointer" onClick={() => copyToClipboard(presentation.id)}>{presentation.id}</p>
            </div>
             <div className="flex justify-center space-x-4">
                <button onClick={resetPresentation} className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors">Reset Votes</button>
                <button onClick={startNewPresentation} className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">New Presentation</button>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Participants ({participants.length})</h3>
              <div className="max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                {participants.length > 0 ? participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <span className="text-gray-400">{p.votedOn.length} / {presentation.questions.length} voted</span>
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex justify-center items-center">
      <div className="w-full max-w-3xl">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
              <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Create New Presentation</h1>
              
              <div className="mb-6 p-4 bg-primary-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <SparklesIcon className="w-6 h-6 text-primary-500" />
                  <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-300">Generate with AI</h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g., 'Fun facts about space'" className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-600 dark:text-white" disabled={isGenerating}/>
                  <button type="button" onClick={handleGeneratePoll} disabled={isGenerating || !aiTopic.trim()} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 transition-colors flex items-center justify-center gap-2">
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Presentation Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Trivia Night!" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"/>
              </div>

              <hr className="border-gray-200 dark:border-gray-600"/>
              
              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <div className="w-full pr-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question {qIndex + 1}</label>
                            <input type="text" value={q.question} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} placeholder="What is your favorite color?" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <button type="button" onClick={() => removeQuestion(qIndex)} disabled={questions.length <= 1} className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 disabled:text-gray-300 dark:disabled:text-gray-500">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Options</label>
                          {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2 mb-2">
                                  <input type="text" value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" />
                                  <button type="button" onClick={() => removeOption(qIndex, oIndex)} disabled={q.options.length <= 2} className="p-2 text-gray-400 hover:text-red-500 disabled:text-gray-300 dark:disabled:text-gray-500">
                                    <TrashIcon className="w-5 h-5" />
                                  </button>
                              </div>
                          ))}
                          <button type="button" onClick={() => addOption(qIndex)} disabled={q.options.length >= 6} className="mt-1 flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 disabled:text-gray-400 dark:disabled:text-gray-500">
                            <PlusIcon className="w-4 h-4" /> Add Option
                          </button>
                      </div>
                  </div>
                ))}
              </div>
              
              <button type="button" onClick={addQuestion} className="w-full py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2">
                  <PlusIcon className="w-5 h-5" /> Add Question
              </button>
              
              <button type="submit" className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors text-lg">
                Create Presentation
              </button>
          </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
