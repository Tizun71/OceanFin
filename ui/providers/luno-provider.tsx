'use client'
import '@luno-kit/ui/styles.css';
import React, { ReactNode } from 'react'
import { LunoKitProvider, LunokitTheme } from '@luno-kit/ui'
import { config } from '@/config/luno-config';

interface LunoProviderProps {
  children: ReactNode
}

const oceanTheme: LunokitTheme = {
  colors: {
    accentColor: '#00C2CB',
    walletSelectItemBackground: '#0F172A',
    walletSelectItemBackgroundHover: 'rgba(0, 194, 203, 0.1)',
    walletSelectItemText: '#F8FAFC',
    connectButtonBackground: 'linear-gradient(135deg, rgba(0, 194, 203, 0.1) 0%, rgba(0, 166, 166, 0.1) 100%)',
    connectButtonInnerBackground: 'rgba(15, 23, 42, 0.6)',
    connectButtonText: '#00C2CB',
    accountActionItemBackground: '#0F172A',
    accountActionItemBackgroundHover: 'rgba(0, 194, 203, 0.1)',
    accountActionItemText: '#F8FAFC',
    accountSelectItemBackground: '#0F172A',
    accountSelectItemBackgroundHover: 'rgba(0, 194, 203, 0.1)',
    accountSelectItemText: '#F8FAFC',
    currentNetworkButtonBackground: 'rgba(15, 23, 42, 0.8)',
    currentNetworkButtonText: '#00C2CB',
    networkSelectItemBackground: '#0F172A',
    networkSelectItemBackgroundHover: 'rgba(0, 194, 203, 0.1)',
    networkSelectItemText: '#F8FAFC',
    navigationButtonBackground: 'rgba(15, 23, 42, 0.6)',
    separatorLine: '#1E293B',
    modalBackground: 'rgba(10, 14, 26, 0.95)',
    modalBackdrop: 'rgba(0, 0, 0, 0.7)',
    modalBorder: 'rgba(30, 41, 59, 0.5)',
    modalText: '#F8FAFC',
    modalTextSecondary: '#64748B',
    modalControlButtonBackgroundHover: 'rgba(0, 194, 203, 0.2)',
    modalControlButtonText: '#00C2CB',
    success: '#10B981',
    successForeground: '#F8FAFC',
    warning: '#F59E0B',
    warningForeground: '#0A0E1A',
    error: '#EF4444',
    errorForeground: '#F8FAFC',
    info: '#00C2CB',
    infoForeground: '#F8FAFC',
    skeleton: 'rgba(30, 41, 59, 0.5)',
  },
  fonts: {
    body: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  radii: {
    walletSelectItem: '0.75rem',
    connectButton: '0.75rem',
    modalControlButton: '0.5rem',
    accountActionItem: '0.75rem',
    accountSelectItem: '0.75rem',
    currentNetworkButton: '0.75rem',
    networkSelectItem: '0.75rem',
    modal: '1rem',
    modalMobile: '1rem',
  },
  shadows: {
    button: '0 0 20px rgba(0, 194, 203, 0.3)',
    modal: '0 0 30px rgba(0, 194, 203, 0.2)',
  },
  blurs: {
    modalOverlay: '16px',
  },
}

export default function LunoProvider({ children }: LunoProviderProps) {
  return (
    <LunoKitProvider 
      config={config} 
      theme={oceanTheme}
    >
      {children}
    </LunoKitProvider>
  )
}