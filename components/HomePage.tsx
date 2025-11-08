
import React from 'react';
import { View } from '../types';
import { UserGroupIcon, PresentationChartBarIcon } from './icons/Icons';

interface HomePageProps {
  setView: (view: View) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setView }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary-600 dark:text-primary-400">
          Live Poll Pro
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Engage your audience with interactive real-time polls.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <div 
          className="flex-1 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-t-4 border-primary-500"
          onClick={() => setView('ADMIN_LOGIN')}
        >
          <div className="flex flex-col items-center text-center">
            <PresentationChartBarIcon className="w-16 h-16 text-primary-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Presentation</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Log in as an admin to create and manage your polls.
            </p>
          </div>
        </div>

        <div 
          className="flex-1 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-t-4 border-teal-500"
          onClick={() => setView('PARTICIPANT_JOIN')}
        >
          <div className="flex flex-col items-center text-center">
            <UserGroupIcon className="w-16 h-16 text-teal-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Join Presentation</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Enter a code to participate in a poll and cast your vote.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
