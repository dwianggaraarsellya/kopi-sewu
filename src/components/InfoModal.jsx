import React from 'react';

export const InfoModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden border border-[#E5E7EB]">
        <div className="bg-[#1B4332] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#2D6A4F]/40">
          <h3 className="font-semibold text-sm text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-300 hover:text-white p-1 cursor-pointer transition-colors"
            aria-label="Tutup"
          >
            <i className="fas fa-times text-base" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-neutral-600 text-xs whitespace-pre-line leading-relaxed font-light">
            {content}
          </p>
          <div className="mt-5 text-right">
            <button
              onClick={onClose}
              className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
