import React from 'react';
import { TeslaTokens } from '../types';
import { TeslaLogo, SunIcon, MoonIcon, GithubIcon, TrashBinIcon } from './icons';
import { GITHUB_REPO_URL } from '../constants';
import BuyMeACoffeeButton from './BuyMeACoffeeButton';


interface DashboardProps {
  tokens: TeslaTokens;
  onLogout: () => void;
  handleRefreshAndRetry: <T>(apiRequest: (accessToken: string) => Promise<T>) => Promise<T | null>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tokens, onLogout, theme, toggleTheme }) => {
  const renderContent = () => {
    return (
        <div className="flex flex-col items-center mt-10">
            <div className="w-full mb-5 text-left bg-white dark:bg-tesla-gray-800/50 border border-gray-200 dark:border-tesla-gray-700 p-5 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Access Token</h2>
                <p className="break-all text-gray-500 dark:text-tesla-gray-400">{tokens.access_token}</p>
            </div>
            <div className="w-full text-left bg-white dark:bg-tesla-gray-800/50 border border-gray-200 dark:border-tesla-gray-700 p-5 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Refresh Token</h2>
                <p className="break-all text-gray-500 dark:text-tesla-gray-400">{tokens.refresh_token}</p>
            </div>
        </div>
    );
  };

  const iconButtonClasses = "p-2 rounded-full hover:bg-gray-200 dark:hover:bg-tesla-gray-700 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-100 dark:focus-visible:ring-offset-tesla-gray-900 active:scale-90 active:bg-gray-300 dark:active:bg-tesla-gray-600";
  
  return (
    <div className="min-h-screen w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-tesla-gray-700/50">
        <div className="flex items-center space-x-4">
            <div 
              className="cursor-pointer p-1 -m-1 rounded-full select-none"
              role="button"
              aria-label="Tesla Logo Easter Egg"
            >
              <TeslaLogo className={`w-8 h-8 transition-colors duration-300 text-tesla-red`} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tesla Auth Tokens</h1>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
           <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={iconButtonClasses}
            aria-label="View source on GitHub"
          >
            <GithubIcon className="w-6 h-6" />
          </a>
           <button
            onClick={toggleTheme}
            className={iconButtonClasses}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
          
          <button
            onClick={onLogout}
            className={iconButtonClasses}
            aria-label="Logout"
          >
            <TrashBinIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main>
        {renderContent()}
      </main>

    </div>
  );
};

export default Dashboard;