
import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ParticipantJoin from './components/ParticipantJoin';
import ParticipantVote from './components/ParticipantVote';
import { Poll, Votes, View, Participant } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Votes>({});
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [currentUser, setCurrentUser] = useState<{name: string, id: string} | null>(null);

  const createPoll = useCallback((question: string, options: string[]) => {
    const newPoll: Poll = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      question,
      options: options.map((opt, index) => ({ id: `opt-${index}`, text: opt })),
      isActive: false,
    };
    setPoll(newPoll);
    setVotes(newPoll.options.reduce((acc, opt) => ({ ...acc, [opt.id]: 0 }), {}));
    setParticipants({});
    setView('ADMIN_DASHBOARD');
  }, []);

  const startPoll = useCallback(() => {
    setPoll(p => (p ? { ...p, isActive: true } : null));
  }, []);
  
  const resetPoll = useCallback(() => {
     if(poll) {
       setVotes(poll.options.reduce((acc, opt) => ({ ...acc, [opt.id]: 0 }), {}));
       setParticipants({});
     }
  }, [poll]);

  const joinPoll = useCallback((name: string, pollId: string) => {
    if (poll && poll.id.toLowerCase() === pollId.toLowerCase()) {
      const participantId = `user-${Date.now()}`;
      setCurrentUser({ name, id: participantId });
      setParticipants(prev => ({ ...prev, [participantId]: { name, voted: false }}));
      if (poll.isActive) {
        setView('PARTICIPANT_VOTE');
      } else {
        setView('PARTICIPANT_WAITING');
      }
      return true;
    }
    return false;
  }, [poll]);

  const submitVote = useCallback((optionId: string) => {
    if (!currentUser || !participants[currentUser.id] || participants[currentUser.id].voted) return;

    setVotes(prev => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
    setParticipants(prev => ({...prev, [currentUser.id]: {...prev[currentUser.id], voted: true}}));
    setView('PARTICIPANT_VOTED');
  }, [currentUser, participants]);

  const renderContent = () => {
    switch (view) {
      case 'HOME':
        return <HomePage setView={setView} />;
      case 'ADMIN_LOGIN':
        return <AdminLogin onLoginSuccess={() => setView('ADMIN_DASHBOARD')} />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboard poll={poll} votes={votes} createPoll={createPoll} startPoll={startPoll} resetPoll={resetPoll} participants={Object.values(participants)} setView={setView} />;
      case 'PARTICIPANT_JOIN':
        return <ParticipantJoin joinPoll={joinPoll} />;
      case 'PARTICIPANT_VOTE':
        return poll && currentUser ? <ParticipantVote poll={poll} submitVote={submitVote} /> : <ParticipantJoin joinPoll={joinPoll} error="Poll not found or user not set." />;
      case 'PARTICIPANT_WAITING':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Waiting for the poll to start...</h1>
            <p className="text-lg">The presenter will begin shortly.</p>
            <div className="mt-8 w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
          </div>
        );
      case 'PARTICIPANT_VOTED':
        return (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h1 className="text-3xl font-bold mb-2 text-center">Thank you for voting!</h1>
            <p className="text-lg">Your response has been recorded.</p>
          </div>
        );
      default:
        return <HomePage setView={setView} />;
    }
  };

  return <div className="min-h-screen font-sans">{renderContent()}</div>;
};

export default App;
