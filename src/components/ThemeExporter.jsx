import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Code, FileCode2 } from 'lucide-react';
import { generateTailwindConfig, generateCssVariables } from '../utils/themeUtils';
import { useLanguage } from '../contexts/LanguageContext';

const ThemeExporter = ({ theme }) => {
  const [activeTab, setActiveTab] = useState('css');
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  if (!theme) return null;

  const codeString = activeTab === 'css' 
    ? generateCssVariables(theme) 
    : generateTailwindConfig(theme);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-4xl mx-auto mt-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl"
    >
      <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <button
          onClick={() => setActiveTab('css')}
          className={`flex items-center gap-2 px-6 py-4 font-body font-medium transition-colors ${
            activeTab === 'css' 
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-white dark:bg-gray-900' 
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          {t('cssVariables')}
        </button>
        <button
          onClick={() => setActiveTab('tailwind')}
          className={`flex items-center gap-2 px-6 py-4 font-body font-medium transition-colors ${
            activeTab === 'tailwind' 
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-white dark:bg-gray-900' 
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Code className="w-4 h-4" />
          {t('tailwindConfig')}
        </button>
        <div className="ml-auto flex items-center pr-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-lg transition-colors font-body text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t('copied') : t('copyCode')}
          </button>
        </div>
      </div>
      <div className="p-6 overflow-x-auto bg-[#0d1117]">
        <pre className="text-sm font-mono text-[#e6edf3]">
          <code>{codeString}</code>
        </pre>
      </div>
    </motion.div>
  );
};

export default ThemeExporter;
