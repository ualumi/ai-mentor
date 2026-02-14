// context/CodeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const CodeContext = createContext(null); // лучше null для явной проверки

export const CodeProvider = ({ children }) => {
  const [code, setCode] = useState('print("Hello")');
  
  const value = {
    code,
    setCode
  };
  
  return (
    <CodeContext.Provider value={value}>
      {children}
    </CodeContext.Provider>
  );
};

export const useCode = () => {
  const context = useContext(CodeContext);
  if (context === null) {  // более строгая проверка
    throw new Error('useCode must be used within CodeProvider');
  }
  return context;
};