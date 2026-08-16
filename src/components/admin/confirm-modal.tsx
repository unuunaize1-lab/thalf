import React, { useEffect, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isProcessing = false,
  onConfirm,
  onCancel,
  isDestructive = true,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus modal for accessibility
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-cream border border-parchment w-full max-w-md p-6 shadow-2xl relative outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-dark/40 hover:text-dark disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-4 pt-2">
          <h2 id="modal-title" className="text-xl font-serif font-black uppercase text-dark border-b border-parchment pb-3">
            {title}
          </h2>
          <p id="modal-description" className="text-sm text-dark/80 whitespace-pre-wrap leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end sm:space-x-3 mt-8 pt-4 border-t border-parchment gap-3 sm:gap-0">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2 border border-parchment text-xs font-bold uppercase tracking-wider text-dark/70 hover:bg-parchment/40 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`w-full sm:w-auto px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center disabled:opacity-50 ${
              isDestructive
                ? 'bg-rose-700 hover:bg-rose-800 text-white'
                : 'bg-gold hover:bg-gold/90 text-dark'
            }`}
          >
            {isProcessing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {isProcessing ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
