'use client'
import '@luno-kit/ui/styles.css';
import React, { ReactNode } from 'react'
import { createConfig } from '@luno-kit/react'
import { LunoKitProvider } from '@luno-kit/ui'
import {
  polkadot,
  kusama,
  westend,
} from '@luno-kit/react/chains'
import {
  polkadotjsConnector,
  subwalletConnector,
  talismanConnector,
} from '@luno-kit/react/connectors'

const config = createConfig({
  chains: [polkadot, kusama, westend],
  connectors: [
    polkadotjsConnector(),
    subwalletConnector(),
    talismanConnector(),
  ],
})

interface LunoProviderProps {
  children: ReactNode
}

export default function LunoProvider({ children }: LunoProviderProps) {
  return <LunoKitProvider config={config}>{children}</LunoKitProvider>
}
