import { Injectable } from '@nestjs/common';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  tool,
  streamText,
  stepCountIs,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  Output,
} from 'ai';
import z from 'zod';
import type { ServerResponse } from 'node:http';

const STRATEGY_SYSTEM_PROMPT = `You are a DeFi strategist AI agent on the Hydration protocol (Polkadot ecosystem).
Your job is to analyze user requirements and generate optimal leveraged looping strategies.

## How It Works

You have access to the \`getHydrationMetadata\` tool which returns available DeFi pairs with their APY, LTV, and type.
You MUST call this tool first before generating any strategy.

## Strategy Generation Rules

### Lending Looping Pattern
For pairs with type "Lending", the strategy follows this looping pattern:
1. Start with ENABLE_E_MODE (always the first step)
2. Repeat the following loop N times:
   - SWAP: Convert base asset to derivative asset (e.g., DOT -> gDOT). Apply 1% slippage to the output amount.
   - SUPPLY: Supply the derivative asset as collateral.
   - BORROW: Borrow the base asset against the collateral. Borrow amount = previous supply amount * LTV.
3. The borrowed amount from each loop becomes the input for the next loop's SWAP step.

### Loop Count Rules
The optimal number of loops is between 3 and 5, determined by the LTV:
- LTV >= 0.75: 3 loops (high LTV, diminishing returns quickly)
- LTV >= 0.6: 4 loops (medium LTV, moderate compounding benefit)
- LTV < 0.6: 5 loops (low LTV, needs more loops to build leverage)

### Pair Selection
When the user wants to maximize yield, select the pair with the highest APY.
When the user mentions a specific asset (e.g., "gDOT", "vDOT"), select the matching pair.
Consider user risk tolerance: higher LTV = higher risk but fewer loops needed.

## Asset Reference

Available assets and their IDs:
- DOT: assetId "5", symbol "DOT"
- GDOT: assetId "69", symbol "GDOT"
- VDOT: assetId "15", symbol "VDOT"
- USDT: assetId "10", symbol "USDT"

Pair mappings:
- "gDOT-DOT" means swap DOT -> GDOT (base=DOT, derivative=GDOT)
- "vDOT-DOT" means swap DOT -> VDOT (base=DOT, derivative=VDOT)
- "ETH-USD" means swap USDT -> ETH (base=USDT, derivative=ETH) — skip this pair if no matching asset IDs exist

## Step Types
Available step types: ENABLE_E_MODE, SWAP, SUPPLY, BORROW, JOIN_STRATEGY, ENABLE_BORROWING

## Agent
Always use agent: "HYDRATION"

## Calculation Rules
- Apply 1% slippage on every SWAP output amount
- Borrow amount = supply amount * LTV
- Round all amounts to 3 decimal places
- If the user does not specify an amount, default to 100 of the base asset

## Calculation Example

For a 100 DOT deposit with gDOT-DOT pair (LTV=0.8, 3 loops):
- Step 1: ENABLE_E_MODE
- Step 2: SWAP 100 DOT -> 99 GDOT (1% slippage)
- Step 3: SUPPLY 99 GDOT
- Step 4: BORROW 79.2 DOT (99 * 0.8)
- Step 5: SWAP 79.2 DOT -> 78.408 GDOT (1% slippage)
- Step 6: SUPPLY 78.408 GDOT
- Step 7: BORROW 62.726 DOT (78.408 * 0.8)
- Step 8: SWAP 62.726 DOT -> 62.099 GDOT (1% slippage)
- Step 9: SUPPLY 62.099 GDOT
- Step 10: BORROW 49.679 DOT (62.099 * 0.8)

totalSupply = 99 + 78.408 + 62.099 = 239.507
totalBorrow = 79.2 + 62.726 + 49.679 = 191.605

## Output
Explain your strategy choice: which pair you selected, why, how many loops, and the expected behavior. Do NOT include the JSON — it will be generated separately.`;

const tokenSchema = z.object({
  assetId: z.string().describe('Asset ID (e.g. "5" for DOT, "69" for GDOT)'),
  symbol: z.string().describe('Asset symbol (e.g. "DOT", "GDOT")'),
  amount: z.number().describe('Token amount rounded to 3 decimal places'),
});

const stepSchema = z.object({
  step: z.number().describe('Sequential step number starting at 1'),
  type: z
    .enum([
      'ENABLE_E_MODE',
      'SWAP',
      'SUPPLY',
      'BORROW',
      'JOIN_STRATEGY',
      'ENABLE_BORROWING',
    ])
    .describe('Step type'),
  agent: z.literal('HYDRATION').describe('Agent identifier'),
  tokenIn: tokenSchema.optional().describe('Input token for this step'),
  tokenOut: tokenSchema.optional().describe('Output token for this step'),
});

const simulateResultSchema = z.object({
  initialCapital: tokenSchema.describe('The initial deposit'),
  loops: z.number().describe('Number of leverage loops (3-5)'),
  fee: z.number().describe('Fee amount (0 for now)'),
  totalSupply: z.number().describe('Sum of all SUPPLY step amounts'),
  totalBorrow: z.number().describe('Sum of all BORROW step amounts'),
  steps: z.array(stepSchema).describe('Ordered list of execution steps'),
});

const getHydrationMetadata = tool({
  description:
    'Get Hydration protocol metadata including available DeFi pairs, APYs, LTVs, and strategy types. Must be called before generating any strategy.',
  inputSchema: z.object({}),
  execute: async () => {
    // TODO: Fetch real data from DeFi protocols
    return [
      {
        pair: 'gDOT-DOT',
        apy: 18.2,
        ltv: 0.8,
        type: 'Lending',
      },
      {
        pair: 'vDOT-DOT',
        apy: 10.1,
        ltv: 0.5,
        type: 'Lending',
      },
      {
        pair: 'ETH-USD',
        apy: 7.5,
        ltv: 0.6,
        type: 'Lending',
      },
    ];
  },
});

@Injectable()
export class DefiAgentService {
  private gemini = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  constructor() {}

  async createStrategy(
    prompt: string,
    res: ServerResponse,
    amount?: number,
  ): Promise<void> {
    const userMessage =
      amount != null ? `${prompt}\n\nInitial capital: ${amount}` : prompt;

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Phase 1: Stream text explanation with tool calling
        const textResult = streamText({
          model: this.gemini('gemini-2.5-flash'),
          system: STRATEGY_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
          tools: { getHydrationMetadata },
          stopWhen: stepCountIs(3),
        });

        // Merge text stream, keep open for the structured output phase
        writer.merge(textResult.toUIMessageStream({ sendFinish: false }));

        // Wait for the explanation to complete
        const explanation = await textResult.text;

        // Phase 2: Generate structured workflow JSON via Output.object()
        const workflowResult = streamText({
          model: this.gemini('gemini-2.5-flash'),
          messages: [
            {
              role: 'user',
              content: `Generate the SimulateResult JSON for this strategy:\n\n${explanation}`,
            },
          ],
          output: Output.object({
            schema: simulateResultSchema,
            name: 'workflow_json',
            description:
              'A SimulateResult object describing the DeFi looping strategy execution steps',
          }),
        });

        // Wait for the validated structured output
        const workflowJson = await workflowResult.output;

        // Write as a custom data part so frontend can catch type "data-workflow_json"
        writer.write({
          type: 'data-workflow_json',
          data: workflowJson,
        });
      },
    });

    pipeUIMessageStreamToResponse({ response: res, stream });
  }
}
