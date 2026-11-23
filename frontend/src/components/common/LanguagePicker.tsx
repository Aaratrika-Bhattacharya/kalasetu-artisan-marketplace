import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';
import { Globe } from 'lucide-react';

const LANGUAGES: Array<{ code: Language; label: string; script: string }> = [
  { code: 'en', label: 'English', script: 'EN' },
  { code: 'hi', label: 'हिन्दी', script: 'HI' },
  { code: 'bn', label: 'বাংলা', script: 'BN' },
  { code: 'gu', label: 'ગુજરાતી', script: 'GU' },
];

export const LanguagePicker: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 bg-stone-100/80 p-1 rounded-full border border-clayborder text-xs font-medium">
      <Globe className="w-3.5 h-3.5 text-stone-500 ml-1.5 mr-0.5" />
      {LANGUAGES.map((lang) => {
        const isActive = language === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-2.5 py-1 rounded-full transition-all ${
              isActive
                ? 'bg-terracotta-600 text-white font-semibold shadow-sm'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
            }`}
            title={lang.label}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};
