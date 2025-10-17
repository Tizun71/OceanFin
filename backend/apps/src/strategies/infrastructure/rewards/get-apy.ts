import { getSpecificPool, getSpecificPoolData } from "../helpers/hydration/get-specific-pool";

const RAY = 1e27;

const sumPow = (start: number, n: number, ltv: number): number => {
  let total = 0;
  for (let i = start; i <= n; i++) total += Math.pow(ltv, i);
  return total;
};

export async function calculateAPY() {
  const DOTdata: any = await getSpecificPoolData("DOT");
  const vDOTdata: any = await getSpecificPoolData("vDOT");
  const GDOTpool: any = await getSpecificPool("690");

  const liquidityRate = Number(vDOTdata?.liquidityRate ?? 0) / RAY;
  const borrowRate = Number(DOTdata?.variableBorrowRate ?? 0) / RAY;

  const ltv = 0.9;
  const n = 3;
  const vDOTstakeAPY = 0.051; 

  const feeLP =
    GDOTpool?.fee && GDOTpool.fee[1]
      ? Number(GDOTpool.fee[0]) / Number(GDOTpool.fee[1])
      : 0;

  const supplyExposure = sumPow(0, n, ltv);
  const borrowExposure = sumPow(1, n, ltv);

  const apy =
    (liquidityRate + feeLP + vDOTstakeAPY) * supplyExposure -
    borrowRate * borrowExposure;



  return { apy, liquidityRate, borrowRate, feeLP, supplyExposure, borrowExposure };
}