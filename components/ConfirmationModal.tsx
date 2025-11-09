import React from 'react';
import { WarningIcon } from './icons/WarningIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, confirmText, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full text-center border-2 border-yellow-500">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-900/50 mb-4">
          <WarningIcon />
        </div>
        <h2 className="text-3xl font-black text-yellow-400 mb-2 uppercase">{title}</h2>
        <p className="text-lg text-gray-300 mb-6">{message}</p>
        
        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-4">
          <button
            onClick={onCancel}
            className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-md hover:bg-gray-500 transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-red-700 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 transition-colors duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
