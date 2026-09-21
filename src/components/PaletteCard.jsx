import React from 'react';
import { motion } from 'framer-motion';

const PaletteCard = ({ theme, onClick }) => {
  const colors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.accent,
    theme.colors.background,
    theme.colors.text
  ];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl group"
    >
      <div className="flex flex-col h-48">
        {/* We make the first color the largest (e.g. primary) */}
        <div className="flex-1 w-full relative group-hover:scale-105 transition-transform origin-bottom" style={{ backgroundColor: colors[0] }}></div>
        <div className="flex h-1/2 w-full">
          <div className="flex-1 h-full relative group-hover:scale-105 transition-transform origin-top-left" style={{ backgroundColor: colors[1] }}></div>
          <div className="flex-1 h-full relative group-hover:scale-105 transition-transform origin-top" style={{ backgroundColor: colors[2] }}></div>
          <div className="flex-1 h-full relative group-hover:scale-105 transition-transform origin-top-right" style={{ backgroundColor: colors[3] }}></div>
        </div>
      </div>
      <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <span className="font-heading font-semibold text-sm capitalize text-gray-900 dark:text-white">
          {theme.id || 'Custom Theme'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-body text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Preview &rarr;
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default PaletteCard;
