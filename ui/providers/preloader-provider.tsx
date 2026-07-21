"use client";
import { createContext, useContext, useState, ReactNode } from "react";

const SESSION_KEY = "oceanfin:preloader-shown";

interface PreloaderContextType {
  visible: boolean;
  /** Show the preloader once per browser session; subsequent app entries skip it. */
  showOnce: () => void;
  show: () => void;
  hide: () => void;
}

const PreloaderContext = createContext<PreloaderContextType>({
  visible: false,
  showOnce: () => {},
  show: () => {},
  hide: () => {},
});

export const PreloaderProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);

  const hide = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  };

  const showOnce = () => {
    // Already played this session (client-only guard for SSR).
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY)) {
      return;
    }
    setVisible(true);
  };

  return (
    <PreloaderContext.Provider value={{ visible, showOnce, show, hide }}>
      {children}
    </PreloaderContext.Provider>
  );
};

export const usePreloader = () => useContext(PreloaderContext);
