import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  colorSwatch?: string | string[]; // Single hex or array of hexes for palette previews
  group?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  size?: 'sm' | 'md';
  error?: string;
  icon?: React.ReactNode;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  disabled = false,
  className = '',
  searchable,
  size = 'md',
  error,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-enable search if more than 6 options unless explicitly set
  const isSearchable = searchable ?? options.length > 6;

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.description?.toLowerCase().includes(q) ||
        opt.badge?.toLowerCase().includes(q)
    );
  }, [options, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isSearchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, isSearchable]);

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg',
    md: 'px-3.5 py-2 text-sm rounded-xl',
  }[size];

  const renderSwatch = (swatch: string | string[]) => {
    if (Array.isArray(swatch)) {
      return (
        <span className="flex -space-x-1 shrink-0">
          {swatch.map((c, i) => (
            <span
              key={i}
              className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
              style={{ backgroundColor: c }}
            />
          ))}
        </span>
      );
    }
    return (
      <span
        className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs shrink-0"
        style={{ backgroundColor: swatch }}
      />
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearchQuery('');
          }
        }}
        className={`w-full flex items-center justify-between border font-medium transition-all shadow-xs ${sizeClasses} ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-stone-100 border-stone-200 text-stone-400'
            : isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-white text-stone-900 shadow-sm'
            : error
            ? 'border-rose-300 bg-white text-stone-900 hover:border-rose-400'
            : 'border-stone-200 bg-white text-stone-800 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="shrink-0">{icon}</span>}
          {selectedOption?.colorSwatch && renderSwatch(selectedOption.colorSwatch)}
          {selectedOption?.icon && <span className="shrink-0 text-amber-700">{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption ? 'text-stone-400' : 'text-stone-800'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-normal shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[100] max-h-72 flex flex-col rounded-xl border border-amber-200/90 bg-white shadow-2xl py-1 animate-fade-in divide-y divide-stone-100 overflow-hidden">
          {isSearchable && (
            <div className="p-2 border-b border-stone-100 bg-stone-50/60 sticky top-0 z-10 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-60 divide-y divide-stone-50">
            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-xs text-stone-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs sm:text-sm transition-colors ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 font-semibold'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {option.colorSwatch && renderSwatch(option.colorSwatch)}
                      {option.icon && <span className="shrink-0 text-amber-700">{option.icon}</span>}
                      <div className="truncate">
                        <div className="truncate">{option.label}</div>
                        {option.description && (
                          <div className="text-[11px] text-stone-400 font-normal truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {option.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-normal">
                          {option.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
