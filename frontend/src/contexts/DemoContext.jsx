import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DEMO_SESSION_KEY = 'ntrip_demo_name';
const DemoContext = createContext(null);

function readDemoName() {
  try { return sessionStorage.getItem(DEMO_SESSION_KEY) || ''; }
  catch { return ''; }
}

export function DemoProvider({ children }) {
  const [demoName, setDemoName] = useState(readDemoName);

  const enterDemo = useCallback((name = '여행자') => {
    const safeName = String(name).trim().slice(0, 30) || '여행자';
    try { sessionStorage.setItem(DEMO_SESSION_KEY, safeName); } catch { /* memory-only fallback */ }
    setDemoName(safeName);
  }, []);

  const exitDemo = useCallback(() => {
    try { sessionStorage.removeItem(DEMO_SESSION_KEY); } catch { /* memory-only fallback */ }
    setDemoName('');
  }, []);

  const value = useMemo(() => ({ demoName, enterDemo, exitDemo }), [demoName, enterDemo, exitDemo]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be called inside DemoProvider');
  return value;
}
