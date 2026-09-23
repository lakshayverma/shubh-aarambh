import React from 'react';

interface CustomToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelLeft?: string;
  labelRight?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
  checked,
  onChange,
  labelLeft,
  labelRight,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {labelLeft && (
        <span
          onClick={() => !disabled && onChange(false)}
          className={`text-xs font-semibold cursor-pointer select-none transition-colors ${
            !checked
              ? 'text-amber-800 dark:text-amber-300 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600'
          }`}
        >
          {labelLeft}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
          checked ? 'bg-amber-600 dark:bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>

      {labelRight && (
        <span
          onClick={() => !disabled && onChange(true)}
          className={`text-xs font-semibold cursor-pointer select-none transition-colors ${
            checked
              ? 'text-amber-800 dark:text-amber-300 font-bold'
              : 'text-stone-400 dark:text-stone-500 hover:text-stone-600'
          }`}
        >
          {labelRight}
        </span>
      )}
    </div>
  );
};
