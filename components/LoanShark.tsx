import React from 'react';
import { LOAN_AMOUNT, LOAN_INTEREST_RATE, LOAN_REPAY_DAYS } from '../constants';
import type { PlayerState } from '../types';
import { SharkIcon } from './icons/SharkIcon';

interface LoanSharkProps {
  player: PlayerState;
  onTakeLoan: () => void;
  onRepayLoan: () => void;
}

const LoanShark: React.FC<LoanSharkProps> = ({ player, onTakeLoan, onRepayLoan }) => {
  const { loanTaken, debt, cash } = player;

  const renderOffer = () => (
    <div className="text-center py-4">
      <p className="mb-4 text-gray-400">"Need a little... startup capital? I can help. For a price."</p>
      <div className="bg-gray-900/50 p-3 rounded-lg my-4 text-left space-y-2 text-sm">
        <div className="flex justify-between"><span>Loan Amount:</span> <span className="font-bold text-green-400">${LOAN_AMOUNT.toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Interest Rate:</span> <span className="font-bold text-red-400">{(LOAN_INTEREST_RATE * 100).toFixed(0)}% per day</span></div>
        <div className="flex justify-between"><span>Repayment Due:</span> <span className="font-bold">{LOAN_REPAY_DAYS} days</span></div>
      </div>
      <button
        onClick={onTakeLoan}
        className="w-full bg-green-600 text-white font-bold py-3 px-2 rounded-md hover:bg-green-500 transition-colors"
      >
        Take the Loan
      </button>
    </div>
  );

  const renderCollection = () => {
    const canRepay = cash >= debt;
    return (
      <div className="text-center py-4">
        <p className="mb-4 text-gray-400">"Time is money, friend. And you owe me both."</p>
        <div className="bg-gray-900/50 p-3 rounded-lg my-4 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span>Current Debt:</span> <span className="font-bold text-red-400">${debt.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Repayment Due:</span> <span className="font-bold">{LOAN_REPAY_DAYS} days from start</span></div>
        </div>
        <button
          onClick={onRepayLoan}
          disabled={!canRepay}
          className="w-full bg-red-600 text-white font-bold py-3 px-2 rounded-md hover:bg-red-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Repay ${debt.toLocaleString()}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-3">
        <SharkIcon />
        <h2 className="text-xl font-bold mb-1">Sharky's Loans</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">"Quick Cash, No Questions Asked"</p>
      {loanTaken ? renderCollection() : renderOffer()}
    </div>
  );
};

export default LoanShark;
