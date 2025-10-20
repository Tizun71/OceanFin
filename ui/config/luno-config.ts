import { createConfig } from '@luno-kit/react'
import { subwalletConnector } from '@luno-kit/react/connectors'
import { hydration } from './chains/hydration'

export const config = createConfig({
  appName: 'My Polkadot App',
  chains: [hydration],
  connectors: [subwalletConnector()],
})