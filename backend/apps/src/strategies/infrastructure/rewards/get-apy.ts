import { STRATEGY_LIST } from "src/strategies/application/strategy-list";
import { getSpecificPool, getSpecificPoolData } from "../helpers/hydration/get-specific-pool";

const RAY = 1e27;

const sumPow = (start: number, n: number, ltv: number): number => {
  let total = 0;
  for (let i = start; i <= n; i++) total += Math.pow(ltv, i);
  return total;
};

const fetchVDOTAPY = async (): Promise<number> => {
  try {
    const response = await fetch("https://dapi.bifrost.io/api/site");
    const data = await response.json();
    const vDOTAPY = data?.vDOT?.apy || data?.apy?.vDOT || 0;

    return Number(vDOTAPY) / 100;
  } catch (error) {
    console.error("Failed to fetch vDOT APY from Bifrost:", error);
    return 0;
  }
};



export async function calculateAPY(strategistName: string) {
  if (strategistName === STRATEGY_LIST.gDOT_LOOPING) {
    return await calGdotAPY();
  }
  if (strategistName === STRATEGY_LIST.vDOT_LOOPING) {
    return await calVDotAPY();
  }
  throw new Error('Strategy not found');

}

async function calGdotAPY() {
  const DOTdata: any = await getSpecificPoolData("DOT");
  const vDOTdata: any = await getSpecificPoolData("vDOT");
  const GDOTpool: any = await getSpecificPool("690");

  const liquidityRate = Number(vDOTdata?.liquidityRate ?? 0) / RAY + Number(DOTdata?.liquidityRate ?? 0) / RAY;
  const borrowRate = Number(DOTdata?.variableBorrowRate ?? 0) / RAY;

  const ltv = 0.9;
  const n = 3;
  const vDOTstakeAPY = await fetchVDOTAPY();

  const feeLP =
    GDOTpool?.fee && GDOTpool.fee[1]
      ? Number(GDOTpool.fee[0]) / Number(GDOTpool.fee[1])
      : 0;

  const supplyExposure = sumPow(0, n, ltv);
  const borrowExposure = sumPow(1, n, ltv);

  const apy =
    ((liquidityRate + feeLP + vDOTstakeAPY) * supplyExposure -
      borrowRate * borrowExposure) * 100;

  return { apy };
}

async function calVDotAPY() {
  const DOTdata: any = await getSpecificPoolData("DOT");
  const vDOTdata: any = await getSpecificPoolData("vDOT");

  const liquidityRate = Number(vDOTdata?.liquidityRate ?? 0) / RAY;
  const borrowRate = Number(DOTdata?.variableBorrowRate ?? 0) / RAY;

  const ltv = 0.9;
  const n = 3;
  const vDOTstakeAPY = await fetchVDOTAPY();

  const supplyExposure = sumPow(0, n, ltv);
  const borrowExposure = sumPow(1, n, ltv);

  const apy =
    ((liquidityRate + vDOTstakeAPY) * supplyExposure -
      borrowRate * borrowExposure) * 100;

  return { apy };
}