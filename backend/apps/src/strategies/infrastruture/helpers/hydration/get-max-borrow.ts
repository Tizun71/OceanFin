export async function getMaxLTV() {
  //TODO: Implement this function
  return 0.9;
}

export async function getMaxBorrow(assetBorrowId: string, amount: number) {
  const maxLTV = await getMaxLTV();
  return Number((amount * maxLTV).toFixed(3));
}
