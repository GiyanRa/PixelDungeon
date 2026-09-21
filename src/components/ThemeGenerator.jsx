import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ThemeGenerator = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl"
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 dark:text-white mb-3 tracking-tight">
          {t('craftYourVibe')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-body text-lg">
          {t('describeMood')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-700 p-2 shadow-inner">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('placeholderPrompt')}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white font-body px-4 py-2 placeholder-gray-400 dark:placeholder-gray-500"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-body font-medium px-6 py-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            <span>{isGenerating ? t('generating') : t('generate')}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ThemeGenerator;
