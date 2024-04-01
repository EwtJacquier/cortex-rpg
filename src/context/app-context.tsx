import { createContext, useContext, useEffect, useState } from 'react';

interface AppProps {
  windowSize?: {width: number, height: number};
}

const AppContext = createContext<AppProps>({});

export const useApp = () => {
  return useContext(AppContext);
}

export const AppProvider = ({children}: any) => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener("resize", handleResize);
     
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const value = {
    windowSize
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}