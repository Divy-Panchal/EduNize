import React from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg text-black">
        <h2 className="text-2xl font-bold mb-4">Welcome to Edunize!</h2>
        <p className="mb-4">This is the onboarding screen.</p>
        <button 
          onClick={onComplete}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Complete
        </button>
      </div>
    </div>
  );
};