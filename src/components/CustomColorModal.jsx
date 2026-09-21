import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const CustomColorModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  
  const [colors, setColors] = useState({
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#06b6d4',
    background: '#0f172a',
    text: '#f8fafc'
  });

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const customTheme = {
      id: `custom-${Date.now()}`,
      category: 'new',
      colors: { ...colors },
      fonts: {
        heading: "Inter",
        body: "Roboto"
      }
    };
    onSave(customTheme);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        ></motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              {t('createCustom')}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {Object.entries(colors).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
                    {key}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{value}</p>
                </div>
                
                <div className="relative w-16 h-12 rounded-lg overflow-hidden shadow-inner border border-gray-200 dark:border-gray-600 cursor-pointer">
                  <input 
                    type="color" 
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
            >
              <Save className="w-5 h-5" /> {t('savePalette')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CustomColorModal;
