
import { createConfig } from "@luno-kit/react";
import { paseo } from "@luno-kit/react/chains";
import { mimirConnector } from "@luno-kit/react/connectors"; 

export const lunoConfig = createConfig({
  appName: "MyProject",
  chains: [paseo],
  connectors: [mimirConnector()],
  autoConnect: true,
});
