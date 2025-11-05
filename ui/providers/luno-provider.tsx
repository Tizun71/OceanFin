'use client'
import '@luno-kit/ui/styles.css';
import React, { ReactNode } from 'react'
import { LunoKitProvider } from '@luno-kit/ui'

import { config } from '@/config/luno-config';

interface LunoProviderProps {
  children: ReactNode
}

export default function LunoProvider({ children }: LunoProviderProps) {
  return <LunoKitProvider config={config}>{children}</LunoKitProvider>
}