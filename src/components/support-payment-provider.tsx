'use client';
import {createContext, useContext, useState, type ReactNode} from 'react';

const SupportPaymentContext = createContext({reference: '', confirm: (_reference: string) => {}});
export function SupportPaymentProvider({children}: {children: ReactNode}) {
  const [reference, confirm] = useState('');
  return <SupportPaymentContext.Provider value={{reference, confirm}}>{children}</SupportPaymentContext.Provider>;
}
export function useSupportPayment() { return useContext(SupportPaymentContext); }
