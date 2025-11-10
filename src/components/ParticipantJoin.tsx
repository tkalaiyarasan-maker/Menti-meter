import React, { useState } from 'react';

interface ParticipantJoinProps {
  joinPoll: (name: string, pollId: string) => boolean;
  error?: string;
}

const ParticipantJoin: React.FC<ParticipantJoinProps> = ({ joinPoll, error: initialError }) => {
  const [name, setName] = useState('');
  const [pollId, setPollId] = useState('');
  const [error, setError] = useState(initialError || '');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pollId.trim()) {
      setError('Please enter your name and the poll ID.');
      return;
    }
    const success = joinPoll(name, pollId);
    if (!success) {
      setError('Invalid Poll ID. Please check the code and try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join a Presentation</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Enter your name and the ID to start voting.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleJoin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name-input" className="sr-only">Your Name</label>
              <input
                id="name-input"
                name="name"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="pollid-input" className="sr-only">Poll ID</label>
              <input
                id="pollid-input"
                name="pollId"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm uppercase"
                placeholder="Poll ID"
                value={pollId}
                onChange={(e) => setPollId(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParticipantJoin;
