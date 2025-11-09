import React, { useState } from 'react';
import { BankIcon } from './icons/BankIcon';

interface BankProps {
  playerCash: number;
  bankBalance: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

const Bank: React.FC<BankProps> = ({ playerCash, bankBalance, onDeposit, onWithdraw }) => {
  const [amount, setAmount] = useState<number | string>('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setAmount('');
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setAmount(numValue);
    }
  };

  const handleBlur = () => {
    if (amount === '') setAmount(0);
  };
  
  const transactionAmount = Number(amount) || 0;

  const canDeposit = transactionAmount > 0 && playerCash >= transactionAmount;
  const canWithdraw = transactionAmount > 0 && bankBalance >= transactionAmount;

  const handleDepositClick = () => {
    onDeposit(transactionAmount);
    setAmount('');
  };

  const handleWithdrawClick = () => {
    onWithdraw(transactionAmount);
    setAmount('');
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <div className="flex items-center gap-3">
        <BankIcon />
        <h2 className="text-xl font-bold mb-1">Swiss Bank</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">Secure Offshore Banking</p>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg">
          <span className="font-semibold text-gray-400">Cash on Hand:</span>
          <span className="font-bold text-green-400">${playerCash.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center bg-gray-900/50 p-2 rounded-lg">
          <span className="font-semibold text-gray-400">Account Balance:</span>
          <span className="font-bold text-blue-400">${bankBalance.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <label htmlFor="bank-amount" className="block text-sm font-medium text-gray-300 mb-2">Transaction Amount:</label>
        <div className="flex items-center gap-2">
            <span className="text-xl text-gray-400 font-semibold">$</span>
            <input
                id="bank-amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                onBlur={handleBlur}
                min="0"
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                placeholder="0"
            />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
            <button onClick={() => setAmount(playerCash)} className="text-xs bg-gray-700/80 hover:bg-gray-700 rounded py-1 transition-colors font-semibold">Max Deposit</button>
            <button onClick={() => setAmount(bankBalance)} className="text-xs bg-gray-700/80 hover:bg-gray-700 rounded py-1 transition-colors font-semibold">Max Withdraw</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
            onClick={handleDepositClick}
            disabled={!canDeposit}
            className="w-full bg-green-600 text-white font-bold py-3 px-2 rounded-md hover:bg-green-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            Deposit
        </button>
        <button
            onClick={handleWithdrawClick}
            disabled={!canWithdraw}
            className="w-full bg-blue-600 text-white font-bold py-3 px-2 rounded-md hover:bg-blue-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            Withdraw
        </button>
      </div>

    </div>
  );
};

export default Bank;