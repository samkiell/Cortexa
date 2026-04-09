'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  type?: 'alert' | 'confirm' | 'success';
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}: ModalProps) {
  
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'alert': return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'success': return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      default: return <HelpCircle className="h-6 w-6 text-accent" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-surface p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className={`p-3 rounded-full bg-white/5`}>
                {getIcon()}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 w-full mt-4">
                {type === 'confirm' && (
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white transition-all"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    onConfirm?.();
                    if (type === 'alert' || type === 'success') onClose();
                  }}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    variant === 'danger' 
                      ? 'bg-red-500 text-white shadow-red-500/20' 
                      : 'bg-accent text-white shadow-accent/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
