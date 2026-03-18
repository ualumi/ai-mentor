

{/*import React, { createContext, useContext, useState } from 'react';

const CodeContext = createContext(null);

export const CodeProvider = ({ children }) => {
  const [code, setCode] = useState(''); // ✅ строка по умолчанию
  
  return (
    <CodeContext.Provider value={{ code, setCode }}>
      {children}
    </CodeContext.Provider>
  );
};

export const useCode = () => {
  const context = useContext(CodeContext);
  if (context === null) {
    throw new Error('useCode must be used within CodeProvider');
  }
  return context;
};*/}


import React, { createContext, useContext, useState, useEffect } from 'react';

const CodeContext = createContext(null);

export const CodeProvider = ({ children, initialCode = "" }) => {
  const [code, setCode] = useState(initialCode);

  // 🔥 важно: обновлять код, когда приходит новый attempt
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  return (
    <CodeContext.Provider value={{ code, setCode }}>
      {children}
    </CodeContext.Provider>
  );
};

export const useCode = () => {
  const context = useContext(CodeContext);
  if (context === null) {
    throw new Error('useCode must be used within CodeProvider');
  }
  return context;
};