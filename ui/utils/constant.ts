// TEST
export const TEST_USER_PUBLIC_ADDRESS = "12iym2gkLRgMPcsEoZvcwsYhGc2aBbj4qqdpisMu2hQoDgd7";

// ENUM
export enum ASSET_ID {
    DOT = '5',
    USDT = '10',
    VDOT = '15',
    GDOT = '69'
}

export enum ASSET_SYMBOL {
    DOT = 'DOT',
    USDT = 'USDT',
    VDOT = 'vDOT',
    GDOT = 'gDOT'
}

export enum AGENT {
  HYDRATION = 'HYDRATION',
}

export enum STEP_TYPE {
  JOIN_STRATEGY = 'JOIN_STRATEGY',
  BORROW = 'BORROW',
  ENABLE_BORROWING = 'ENABLE_BORROWING',
  ENABLE_E_MODE = 'ENABLE_E_MODE',
}

export enum EMODE_CATEGORY {
  STABLECOIN = 1,
  DOT_CORRELATED = 2,
  ETH_CORRELATED = 3
};

// CONSTANTS
export const SLIPPAGE_TOLERANCE = 0.01; // 1%