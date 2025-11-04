import { createConfig } from '@luno-kit/react'
import { subwalletConnector } from '@luno-kit/react/connectors'
import { hydration } from './chains/hydration'

export const config = createConfig({
  appName: 'OceanFin App',
  chains: [hydration],
  connectors: [subwalletConnector()],
})