import React, { createContext, useContext, useState } from 'react';

interface MyShopsModalContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const MyShopsModalContext = createContext<MyShopsModalContextType>({ open: false, setOpen: () => {} });

export const useMyShopsModal = () => useContext(MyShopsModalContext);

export function MyShopsModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MyShopsModalContext.Provider value={{ open, setOpen }}>
      {children}
    </MyShopsModalContext.Provider>
  );
}
