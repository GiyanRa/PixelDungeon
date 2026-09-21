import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const ThemePreview = ({ theme }) => {
  const { t } = useLanguage();
  if (!theme) return null;

  const themeStyles = {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-background': theme.colors.background,
    '--color-text': theme.colors.text,
    '--font-heading': `"${theme.fonts.heading}", sans-serif`,
    '--font-body': `"${theme.fonts.body}", sans-serif`,
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12" style={themeStyles}>
      {/* Palette & Typography Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-theme-background/60 p-6 rounded-2xl border border-theme-primary/20 backdrop-blur-sm"
        >
          <h3 className="font-heading text-xl text-theme-text mb-4">{t('colorPalette')}</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(theme.colors).map(([name, hex]) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div 
                  className="w-16 h-16 rounded-full shadow-lg border-2 border-theme-background"
                  style={{ backgroundColor: hex }}
                  title={name}
                ></div>
                <span className="text-xs font-body text-theme-text/80 capitalize">{name}</span>
                <span className="text-xs font-body text-theme-text/50 uppercase">{hex}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-theme-background/60 p-6 rounded-2xl border border-theme-secondary/20 backdrop-blur-sm flex flex-col justify-center"
        >
          <h3 className="font-heading text-xl text-theme-text mb-4">{t('typography')}</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-theme-text/50 font-body uppercase tracking-wider mb-1">{t('headingFont')}</p>
              <h2 className="text-4xl font-heading text-theme-text">{theme.fonts.heading}</h2>
            </div>
            <div>
              <p className="text-xs text-theme-text/50 font-body uppercase tracking-wider mb-1">{t('bodyFont')}</p>
              <p className="text-lg font-body text-theme-text/80">{theme.fonts.body} - {t('sampleText')}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mock Portfolio UI */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-theme-background rounded-3xl overflow-hidden shadow-2xl border border-theme-accent/30 relative"
      >
        {/* Mock Navbar */}
        <nav className="flex items-center justify-between p-6 border-b border-theme-text/10 bg-theme-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="font-heading text-2xl font-bold text-theme-primary">DevFolio.</div>
          <div className="hidden md:flex gap-8">
            <a href="#" className="font-body text-theme-text hover:text-theme-primary font-medium transition-colors">{t('home')}</a>
            <a href="#" className="font-body text-theme-text hover:text-theme-primary font-medium transition-colors">{t('about')}</a>
            <a href="#" className="font-body text-theme-text hover:text-theme-primary font-medium transition-colors">{t('projects')}</a>
            <a href="#" className="font-body text-theme-text hover:text-theme-primary font-medium transition-colors">{t('contact')}</a>
          </div>
          <div>
            <button className="bg-theme-primary text-white font-body px-5 py-2 rounded-full hover:bg-theme-secondary transition-colors font-medium">
              {t('hireMe')}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden p-8 md:p-16 flex flex-col items-center text-center">
          <div className="absolute top-10 left-10 w-64 h-64 bg-theme-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-theme-secondary/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-theme-text leading-tight tracking-tight">
              {t('heroTitle')} <span className="text-theme-accent">.</span>
            </h1>
            <p className="text-lg md:text-xl font-body text-theme-text/70">
              {t('heroSubtitle')}
            </p>
            <div className="pt-4 flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 bg-theme-text text-theme-background hover:bg-theme-primary hover:text-white px-8 py-3 rounded-lg font-body font-bold transition-all transform hover:-translate-y-1">
                {t('viewWork')} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="p-8 md:p-16 bg-theme-text/5">
          <h2 className="text-3xl font-heading font-bold text-theme-text mb-8 text-center">{t('featuredProjects')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project Card 1 */}
            <div className="bg-theme-background rounded-2xl overflow-hidden border border-theme-text/10 shadow-lg group">
              <div className="h-48 bg-gradient-to-br from-theme-primary to-theme-secondary opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-heading text-xl font-bold text-theme-text">{t('projectTitle')} 1</h3>
                  <ExternalLink className="w-5 h-5 text-theme-text/50 hover:text-theme-primary cursor-pointer transition-colors" />
                </div>
                <p className="font-body text-theme-text/70 mb-4 text-sm">{t('projectDesc')}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-theme-primary/10 text-theme-primary text-xs font-body rounded-full font-medium">React</span>
                  <span className="px-3 py-1 bg-theme-secondary/10 text-theme-secondary text-xs font-body rounded-full font-medium">Tailwind</span>
                </div>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className="bg-theme-background rounded-2xl overflow-hidden border border-theme-text/10 shadow-lg group">
              <div className="h-48 bg-gradient-to-tr from-theme-accent to-theme-primary opacity-80 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-heading text-xl font-bold text-theme-text">{t('projectTitle')} 2</h3>
                  <ExternalLink className="w-5 h-5 text-theme-text/50 hover:text-theme-primary cursor-pointer transition-colors" />
                </div>
                <p className="font-body text-theme-text/70 mb-4 text-sm">{t('projectDesc')}</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-theme-accent/10 text-theme-accent text-xs font-body rounded-full font-medium">Next.js</span>
                  <span className="px-3 py-1 bg-theme-primary/10 text-theme-primary text-xs font-body rounded-full font-medium">Framer</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="p-8 border-t border-theme-text/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-heading font-bold text-lg text-theme-text">DevFolio.</div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-theme-text/5 flex items-center justify-center text-theme-text hover:bg-theme-primary hover:text-white transition-colors cursor-pointer">
              <FaGithub className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-theme-text/5 flex items-center justify-center text-theme-text hover:bg-theme-secondary hover:text-white transition-colors cursor-pointer">
              <FaTwitter className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-theme-text/5 flex items-center justify-center text-theme-text hover:bg-theme-accent hover:text-white transition-colors cursor-pointer">
              <FaLinkedin className="w-5 h-5" />
            </div>
          </div>
          <div className="font-body text-sm text-theme-text/50">
            &copy; 2026 DevFolio. All rights reserved.
          </div>
        </footer>

      </motion.div>
    </div>
  );
};

export default ThemePreview;
