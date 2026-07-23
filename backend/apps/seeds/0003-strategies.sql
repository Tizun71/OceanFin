-- Avalanche marketplace strategies shown on the home page (FeaturedStrategies + StrategyList).
-- Requires migration 0004 (strategies.title).
--
-- Every strategy here is executable with the protocol adapters that already exist
-- (ui/lib/evm: Aave v3 supply/borrow/setEMode, Trader Joe swap) against the Aave V3
-- Avalanche market and BENQI sAVAX. The matching workflows live in 0004-defi-strategies.sql.
--
-- strategist_name is the dispatch key: StrategyService.reloadAllAPY routes these to
-- AvalancheApyService (see src/strategies/application/strategy-list.ts), which recomputes
-- apy from on-chain state. The apy values below are the readings taken when this seed was
-- written (Aave V3 Avalanche reserve rates + 30d sAVAX exchange-rate drift) and are only a
-- starting point — rates move, and a loop that clears its borrow cost today can invert.
--
-- assets/agents/chains hold ICON PATHS: the cards render them with <Image src={asset} />.
-- Icons resolve to ui/public: /icons/assets/{savax,avax,usdc,usdt}.*, /icons/agents/aave.png,
-- /icons/chains/avax.png.

INSERT INTO strategies (id, title, strategist_name, strategist_handle, apy, tags, assets, agents, chains) VALUES
  (
    'a7c31e00-0001-4a10-9a01-0000000000a1',
    'sAVAX Leveraged Staking (E-Mode)',
    'savax-loop-emode',
    '@oceanfin',
    5.62,
    ARRAY['Looping', 'Liquid Staking', 'E-Mode', 'Avalanche'],
    ARRAY['/icons/assets/savax.png', '/icons/assets/avax.png'],
    ARRAY['/icons/agents/aave.png'],
    ARRAY['/icons/chains/avax.png']
  ),
  (
    'a7c31e00-0002-4a10-9a01-0000000000a2',
    'sAVAX Conservative Loop',
    'savax-loop-conservative',
    '@oceanfin',
    4.50,
    ARRAY['Looping', 'Liquid Staking', 'Low Leverage', 'Avalanche'],
    ARRAY['/icons/assets/savax.png', '/icons/assets/avax.png'],
    ARRAY['/icons/agents/aave.png'],
    ARRAY['/icons/chains/avax.png']
  ),
  (
    'a7c31e00-0003-4a10-9a01-0000000000a3',
    'USDC Supply on Aave V3',
    'usdc-supply-aave',
    '@oceanfin',
    3.74,
    ARRAY['Lending', 'Stablecoin', 'No Leverage', 'Avalanche'],
    ARRAY['/icons/assets/usdc.svg'],
    ARRAY['/icons/agents/aave.png'],
    ARRAY['/icons/chains/avax.png']
  ),
  (
    'a7c31e00-0004-4a10-9a01-0000000000a4',
    'USDt Supply on Aave V3',
    'usdt-supply-aave',
    '@oceanfin',
    3.66,
    ARRAY['Lending', 'Stablecoin', 'No Leverage', 'Avalanche'],
    ARRAY['/icons/assets/usdt.svg'],
    ARRAY['/icons/agents/aave.png'],
    ARRAY['/icons/chains/avax.png']
  ),
  (
    'a7c31e00-0005-4a10-9a01-0000000000a5',
    'USDC Collateral AVAX Carry',
    'usdc-avax-carry',
    '@oceanfin',
    4.31,
    ARRAY['Carry', 'Stablecoin Collateral', 'Liquid Staking', 'Avalanche'],
    ARRAY['/icons/assets/usdc.svg', '/icons/assets/savax.png'],
    ARRAY['/icons/agents/aave.png'],
    ARRAY['/icons/chains/avax.png']
  ),
  -- Aave V4 (Hub & Spoke) strategies. V4 went live on Avalanche 2026-07-15, so
  -- its reserves are still shallow; the apy values below are the readings taken
  -- when this seed was written and AvalancheApyService recomputes them live.
  -- The AVAX-correlated spoke replaces v3 e-mode: a 95% collateral factor with
  -- WAVAX as the only borrowable. It out-earns the v3 loop whenever the sAVAX
  -- staking APR clears the WAVAX borrow rate — at the time of writing it does
  -- not (2.96% staking vs 3.08% borrow), so the levered number sits below the
  -- unlevered one. That is the honest reading, not a placeholder.
  (
    'a7c31e00-0006-4a10-9a01-0000000000a6',
    'sAVAX Leveraged Loop (Aave V4)',
    'savax-loop-v4-correlated',
    '@oceanfin',
    2.73,
    ARRAY['Looping', 'Liquid Staking', 'Aave V4', 'Avalanche'],
    ARRAY['/icons/assets/savax.png', '/icons/assets/avax.png'],
    ARRAY['/icons/agents/aave.png'],
    ARRAY['/icons/chains/avax.png']
  ),
  (
    'a7c31e00-0007-4a10-9a01-0000000000a7',
    'USDC Supply on Aave V4',
    'usdc-supply-aave-v4',
    '@oceanfin',
    2.29,
    ARRAY['Lending', 'Stablecoin', 'Aave V4', 'No Leverage', 'Avalanche'],
    ARRAY['/icons/assets/usdc.svg'],
    ARRAY['/icons/agents/aave.png'],
    ARRAY['/icons/chains/avax.png']
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  strategist_name = EXCLUDED.strategist_name,
  strategist_handle = EXCLUDED.strategist_handle,
  apy = EXCLUDED.apy,
  tags = EXCLUDED.tags,
  assets = EXCLUDED.assets,
  agents = EXCLUDED.agents,
  chains = EXCLUDED.chains;
