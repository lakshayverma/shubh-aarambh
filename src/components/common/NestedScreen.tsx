import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface NestedScreenProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  mode?: 'drawer' | 'modal';
  width?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  level?: 1 | 2;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const NestedScreen: React.FC<NestedScreenProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  mode = 'drawer',
  width = 'xl',
  level = 1,
  children,
  footer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // If we are level 1, only close if no active level 2 drawer is open in DOM
        if (level === 1) {
          const level2Active = document.querySelector('[data-nested-level="2"]');
          if (level2Active) return; // let level 2 handle it
        }
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, level, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-4xl',
    '4xl': 'max-w-5xl',
    full: 'max-w-full',
  }[width];

  const zIndexClass = level === 2 ? 'z-[70]' : 'z-[50]';
  const backdropZ = level === 2 ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/50 backdrop-blur-sm';

  if (mode === 'modal') {
    return (
      <div
        data-nested-level={level}
        className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4 overflow-y-auto ${backdropZ} animate-fade-in`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          ref={containerRef}
          className={`w-full ${widthClasses} bg-white border border-amber-200/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all transform duration-200 scale-100`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/60">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-amber-100 bg-stone-50/80 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Drawer Mode (Slide from Right)
  return (
    <div
      data-nested-level={level}
      className={`fixed inset-0 ${zIndexClass} overflow-hidden ${backdropZ} transition-opacity duration-300`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={containerRef}
          className={`w-screen ${widthClasses} bg-white shadow-2xl border-l border-amber-200/70 flex flex-col transform transition-transform duration-300 ease-in-out`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-amber-100 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  {title}
                </h2>
              </div>
              {subtitle && (
                <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-amber-100/50 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

          {/* Drawer Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-amber-100 bg-stone-50/90 flex items-center justify-end gap-3 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
