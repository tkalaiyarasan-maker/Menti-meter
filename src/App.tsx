import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ParticipantJoin from './components/ParticipantJoin';
import ParticipantVote from './components/ParticipantVote';
import PastPolls from './components/PastPolls';
import { Presentation, AllVotes, View, Participant, PresentationRecord, Question } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [allVotes, setAllVotes] = useState<AllVotes>({});
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [currentUser, setCurrentUser] = useState<{name: string, id: string} | null>(null);
  const [pastPresentations, setPastPresentations] = useState<PresentationRecord[]>([]);

  const createPresentation = useCallback((title: string, questionsData: { question: string, options: string[] }[]) => {
    const newQuestions: Question[] = questionsData.map((q, qIndex) => ({
      id: `q-${qIndex}-${Date.now()}`,
      text: q.question,
      options: q.options.map((opt, oIndex) => ({ id: `opt-${qIndex}-${oIndex}`, text: opt }))
    }));

    const newPresentation: Presentation = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      title,
      questions: newQuestions,
      currentQuestionIndex: 0,
      isActive: false,
    };

    const initialVotes: AllVotes = {};
    newQuestions.forEach(q => {
      initialVotes[q.id] = q.options.reduce((acc, opt) => ({ ...acc, [opt.id]: 0 }), {});
    });

    setPresentation(newPresentation);
    setAllVotes(initialVotes);
    setParticipants({});
    setView('ADMIN_DASHBOARD');
  }, []);

  const startNewPresentation = useCallback(() => {
    if (presentation) {
      setPastPresentations(prev => [...prev, { presentation, votes: allVotes }]);
    }
    setPresentation(null);
    setView('ADMIN_DASHBOARD');
  }, [presentation, allVotes]);
  
  const startPresentation = useCallback(() => {
    setPresentation(p => (p ? { ...p, isActive: true } : null));
  }, []);
  
  const nextQuestion = useCallback(() => {
    setPresentation(p => (p && p.currentQuestionIndex < p.questions.length - 1 ? { ...p, currentQuestionIndex: p.currentQuestionIndex + 1 } : p));
  }, []);

  const previousQuestion = useCallback(() => {
    setPresentation(p => (p && p.currentQuestionIndex > 0 ? { ...p, currentQuestionIndex: p.currentQuestionIndex - 1 } : p));
  }, []);

  const resetPresentation = useCallback(() => {
     if(presentation) {
        const initialVotes: AllVotes = {};
        presentation.questions.forEach(q => {
          initialVotes[q.id] = q.options.reduce((acc, opt) => ({ ...acc, [opt.id]: 0 }), {});
        });
       setAllVotes(initialVotes);
       setParticipants({});
     }
  }, [presentation]);

  const joinPresentation = useCallback((name: string, presentationId: string) => {
    if (presentation && presentation.id.toLowerCase() === presentationId.toLowerCase()) {
      const participantId = `user-${Date.now()}`;
      setCurrentUser({ name, id: participantId });
      setParticipants(prev => ({ ...prev, [participantId]: { name, votedOn: [] }}));
      if (presentation.isActive) {
        setView('PARTICIPANT_VOTE');
      } else {
        setView('PARTICIPANT_WAITING');
      }
      return true;
    }
    return false;
  }, [presentation]);

  const submitVote = useCallback((optionId: string, questionId: string) => {
    if (!currentUser || !participants[currentUser.id] || participants[currentUser.id].votedOn.includes(questionId)) return;

    setAllVotes(prev => ({ 
      ...prev, 
      [questionId]: {
        ...prev[questionId],
        [optionId]: (prev[questionId]?.[optionId] || 0) + 1
      }
    }));
    setParticipants(prev => ({...prev, [currentUser.id]: {...prev[currentUser.id], votedOn: [...prev[currentUser.id].votedOn, questionId]}}));
    setView('PARTICIPANT_VOTED');
  }, [currentUser, participants]);

  const currentQuestion = presentation?.questions[presentation.currentQuestionIndex];
  const hasVotedOnCurrent = currentQuestion && currentUser && participants[currentUser.id]?.votedOn.includes(currentQuestion.id);

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return <HomePage setView={setView} />;
      case 'ADMIN_LOGIN':
        return <AdminLogin onLoginSuccess={() => setView('ADMIN_DASHBOARD')} />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboard presentation={presentation} allVotes={allVotes} createPresentation={createPresentation} startPresentation={startPresentation} resetPresentation={resetPresentation} participants={Object.values(participants)} setView={setView} startNewPresentation={startNewPresentation} pastPollsCount={pastPresentations.length} nextQuestion={nextQuestion} previousQuestion={previousQuestion} />;
      case 'ADMIN_PAST_POLLS':
        return <PastPolls pastPresentations={pastPresentations} setView={setView} />;
      case 'PARTICIPANT_JOIN':
        return <ParticipantJoin joinPoll={joinPresentation} />;
      case 'PARTICIPANT_VOTE':
        if (presentation?.isActive && currentQuestion && !hasVotedOnCurrent) {
            return <ParticipantVote question={currentQuestion} submitVote={submitVote} />;
        }
        // If user already voted on this question, show the voted screen
        if (hasVotedOnCurrent) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
                    <h1 className="text-3xl font-bold mb-4 text-center">Waiting for the next question...</h1>
                    <p className="text-lg">Your vote has been recorded.</p>
                    <div className="mt-8 w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
                </div>
            );
        }
        // Otherwise show waiting screen
        return <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Waiting for the presentation to start...</h1>
            <p className="text-lg">The presenter will begin shortly.</p>
            <div className="mt-8 w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
        </div>
      case 'PARTICIPANT_WAITING':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Waiting for the presentation to start...</h1>
            <p className="text-lg">The presenter will begin shortly.</p>
            <div className="mt-8 w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
          </div>
        );
      case 'PARTICIPANT_VOTED':
        // This view now transitions to waiting for the next question automatically.
        // We can re-use the logic from PARTICIPANT_VOTE case
        if (presentation?.isActive && currentQuestion) {
            return <ParticipantVote question={currentQuestion} submitVote={submitVote} />;
        }
         return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h1 className="text-3xl font-bold mb-2 text-center">Thank you for voting!</h1>
            <p className="text-lg">Waiting for the next question.</p>
          </div>
        );
      default:
        return <HomePage setView={setView} />;
    }
  };

  return <div className="min-h-screen font-sans">{renderContent()}</div>;
};

export default App;
