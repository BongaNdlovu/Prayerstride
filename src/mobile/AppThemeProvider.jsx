import { createContext, useContext, useMemo } from 'react';

const AppThemeContext = createContext({ darkMode: false });

export function AppThemeProvider({ darkMode = false, children }) {
  const value = useMemo(() => ({ darkMode: darkMode === true }), [darkMode]);
  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
