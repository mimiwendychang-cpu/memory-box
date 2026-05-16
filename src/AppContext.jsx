import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// 🎨 定義全站色票
export const themes = [
  { id: 'green', name: '自然綠', icon: '🌿', mainColor: '#4F7942', lightBg: '#4F794215' },
  { id: 'cream', name: '奶油白', icon: '🍦', mainColor: '#D4B895', lightBg: '#D4B89515' },
  { id: 'purple', name: '淡紫', icon: '💜', mainColor: '#8B5FBF', lightBg: '#8B5FBF15' },
  { id: 'ocean', name: '海洋藍', icon: '🌊', mainColor: '#3B719F', lightBg: '#3B719F15' },
  { id: 'orange', name: '暖橘', icon: '🍊', mainColor: '#D97736', lightBg: '#D9773615' },
];

export function AppProvider({ children }) {
  // 從本地端讀取舊設定
  const [currentThemeId, setCurrentThemeId] = useState(() => localStorage.getItem('appThemeId') || 'orange');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('appFontSize') || '16');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('appContrast') === 'true');

  const activeTheme = themes.find(t => t.id === currentThemeId) || themes[4];

  // 當設定改變時，自動存到本地端
  useEffect(() => {
    localStorage.setItem('appThemeId', currentThemeId);
    localStorage.setItem('appFontSize', fontSize);
    localStorage.setItem('appContrast', highContrast);
    
    // 全站字體連動魔法
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [currentThemeId, fontSize, highContrast]);

  return (
    <AppContext.Provider value={{ 
      currentThemeId, setCurrentThemeId, activeTheme, 
      fontSize, setFontSize, 
      highContrast, setHighContrast 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);