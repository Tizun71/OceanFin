"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface PreloaderContextType {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

const PreloaderContext = createContext<PreloaderContextType>({
  visible: false,
  show: () => {},
  hide: () => {},
});

export const PreloaderProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <PreloaderContext.Provider value={{ visible, show, hide }}>
      {children}
    </PreloaderContext.Provider>
  );
};

export const usePreloader = () => useContext(PreloaderContext);
