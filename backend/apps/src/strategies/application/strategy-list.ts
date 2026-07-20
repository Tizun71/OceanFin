export enum STRATEGY_LIST {
  gDOT_LOOPING = 'gDOT-looping',
  vDOT_LOOPING = 'vDOT-looping',
}

/**
 * Avalanche strategy keys. `strategies.strategist_name` doubles as the dispatch
 * key for APY and simulation, so these must match the seeded rows in
 * backend/apps/seeds/0003-strategies.sql exactly.
 */
export enum AVALANCHE_STRATEGY {
  SAVAX_LOOP_EMODE = 'savax-loop-emode',
  SAVAX_LOOP_CONSERVATIVE = 'savax-loop-conservative',
  USDC_SUPPLY = 'usdc-supply-aave',
  USDT_SUPPLY = 'usdt-supply-aave',
  USDC_AVAX_CARRY = 'usdc-avax-carry',
}
