import { Injectable } from "@nestjs/common";
import { DefiPair } from "../domain/defi_pairs.entity";
import { DefiPairsRepository } from "../domain/defi_pairs.repository";
import { DefiTokenService } from "src/defi_token/application/defi_token.service";
import { HydrationSdkService } from "src/shared/infrastructure/hydration-sdk.service";
import { HydrationStrategyService } from "src/strategies/application/hydration-strategy.service";
import { EstimateDefiPairResponseDto } from "../interfaces/dtos/estimate-defi-pair-response.dto";
import { EstimateDefiPairDto } from "../interfaces/dtos/estimate-defi-pair.dto";
import { OperationType } from "../domain/operation-type.enum";
import { UiPoolDataProvider } from "@aave/contract-helpers";
import { PolkadotEvmRpcProvider } from "../../strategies/infrastructure/helpers/hydration/utils/polkadotEVMProvider";

const POOL_DATA_PROVIDER = "0x112b087b60C1a166130d59266363C45F8aa99db0";
const POOL = "0xf3Ba4D1b50f78301BDD7EAEa9B67822A15FCA691";

@Injectable()
export class DefiPairsService {
  constructor(
    private readonly defiPairsRepository: DefiPairsRepository,
    private readonly defiTokenService: DefiTokenService,
    private readonly hydrationSdk: HydrationSdkService,
    private readonly hydrationStrategyService: HydrationStrategyService,
  ) {}

  async createDefiPair(defiPair: DefiPair): Promise<DefiPair> {
    if (defiPair.token_in_id) {
      await this.defiTokenService.getDefiTokenById(defiPair.token_in_id);
    }
    if (defiPair.token_out_id) {
      await this.defiTokenService.getDefiTokenById(defiPair.token_out_id);
    }

    return this.defiPairsRepository.save(defiPair);
  }

  async estimateDefiPair(dto: EstimateDefiPairDto): Promise<EstimateDefiPairResponseDto> {
    switch (dto.operation_type) {
      case OperationType.SWAP:
        return this.estimateSwap(dto.token_in_id, dto.token_out_id!, dto.amount_in);
      case OperationType.SUPPLY:
        return this.estimateSupply(dto.token_in_id, dto.amount_in);
      case OperationType.BORROW:
        return this.estimateBorrow(dto.token_in_id, dto.token_out_id!, dto.amount_in);
      default:
        throw new Error(`Unsupported operation type: ${dto.operation_type}`);
    }
  }

  private async estimateSwap(
    tokenInId: string,
    tokenOutId: string,
    amountIn: number,
  ): Promise<EstimateDefiPairResponseDto> {
    const [tokenIn, tokenOut] = await Promise.all([
      this.defiTokenService.getDefiTokenById(tokenInId),
      this.defiTokenService.getDefiTokenById(tokenOutId),
    ]);

    const { sdk } = await this.hydrationSdk.getApiAndSdk();

    const assetInId = tokenIn.asset_id.toString();
    const assetOutId = tokenOut.asset_id.toString();

    try {
      const amountInRaw = BigInt(Math.floor(amountIn * 10 ** 12));

      const swapResult = await sdk.api.router.getBestSell(assetInId, assetOutId, amountInRaw);

      if (!swapResult || !swapResult.amountOut) {
        throw new Error("Failed to calculate swap estimate");
      }

      let amountOut = 0;

      let priceImpact: number | undefined;
      let fee: number | undefined;

      try {
        const spotPrice = await this.hydrationStrategyService.getAssetPrice(assetInId, assetOutId);
        const actualPrice = spotPrice / amountIn;
        amountOut = spotPrice * amountIn * 0.99;
        priceImpact = ((spotPrice - actualPrice) / spotPrice) * 100;
      } catch (error) {
        console.warn("Failed to calculate price impact:", error.message);
      }

      console.log(priceImpact);

      if (swapResult.swaps && swapResult.swaps.length > 0) {
        const totalFee = swapResult.swaps.reduce((acc: number, swap: any) => {
          return acc + (swap.calculatedFees || 0);
        }, 0);
        fee = totalFee / 10 ** 12;
      }

      const route = swapResult.swaps?.map((swap: any) => swap.assetIn) || [];
      if (route.length > 0) {
        route.push(assetOutId);
      }

      return {
        operation_type: OperationType.SWAP,
        token_in_id: tokenInId,
        token_out_id: tokenOutId,
        amount_in: amountIn,
        amount_out: Number(amountOut.toFixed(6)),
        slippage: 0.01,
      };
    } catch (error) {
      throw new Error(`Failed to estimate swap: ${error.message}`);
    }
  }

  private async estimateSupply(
    tokenInId: string,
    amountIn: number,
  ): Promise<EstimateDefiPairResponseDto> {
    const tokenIn = await this.defiTokenService.getDefiTokenById(tokenInId);

    try {
      const { api } = await this.hydrationSdk.getApiAndSdk();

      const provider = new UiPoolDataProvider({
        uiPoolDataProviderAddress: POOL_DATA_PROVIDER,
        provider: new PolkadotEvmRpcProvider(api),
        chainId: 222222,
      });

      const poolData = await provider.getReservesHumanized({
        lendingPoolAddressProvider: POOL,
      });

      const reserve = poolData.reservesData.find(
        (r) => r.symbol === tokenIn.name || r.id === tokenIn.asset_id.toString(),
      );

      if (!reserve) {
        throw new Error(`No lending pool found for token ${tokenIn.name}`);
      }

      const supplyApy = ((parseFloat(reserve.liquidityRate) * 100) / 1e27).toFixed(2);
      console.log(supplyApy);
      return {
        operation_type: OperationType.SUPPLY,
        token_in_id: tokenInId,
        amount_in: amountIn,
        supply_apy: Number(supplyApy),
      };
    } catch (error) {
      throw new Error(`Failed to estimate supply: ${error.message}`);
    }
  }

  private async estimateBorrow(
    collateralTokenId: string,
    borrowTokenId: string,
    collateralAmount: number,
  ): Promise<EstimateDefiPairResponseDto> {
    const [collateralToken, borrowToken] = await Promise.all([
      this.defiTokenService.getDefiTokenById(collateralTokenId),
      this.defiTokenService.getDefiTokenById(borrowTokenId),
    ]);

    try {
      const { api } = await this.hydrationSdk.getApiAndSdk();

      const provider = new UiPoolDataProvider({
        uiPoolDataProviderAddress: POOL_DATA_PROVIDER,
        provider: new PolkadotEvmRpcProvider(api),
        chainId: 222222,
      });

      const poolData = await provider.getReservesHumanized({
        lendingPoolAddressProvider: POOL,
      });

      const collateralReserve = poolData.reservesData.find(
        (r) => r.symbol === collateralToken.name || r.id === collateralToken.asset_id.toString(),
      );
      const borrowReserve = poolData.reservesData.find(
        (r) => r.symbol === borrowToken.name || r.id === borrowToken.asset_id.toString(),
      );

      if (!collateralReserve) {
        throw new Error(`No lending pool found for collateral token ${collateralToken.name}`);
      }
      if (!borrowReserve) {
        throw new Error(`No lending pool found for borrow token ${borrowToken.name}`);
      }

      const ltv = parseFloat(collateralReserve.baseLTVasCollateral) / 10000;
      const borrowApy = (parseFloat(borrowReserve.variableBorrowRate) * 100) / 1e27;

      const spotPrice = await this.hydrationStrategyService.getAssetPrice(
        collateralToken.asset_id.toString(),
        borrowToken.asset_id.toString(),
      );
      const maxBorrowAmount = collateralAmount * (ltv - ltv * 0.1) * spotPrice * 0.99;

      return {
        operation_type: OperationType.BORROW,
        token_in_id: collateralTokenId,
        token_out_id: borrowTokenId,
        amount_in: collateralAmount,
        amount_out: Number(maxBorrowAmount.toFixed(6)),
        borrow_apy: Number(borrowApy.toFixed(2)),
      };
    } catch (error) {
      throw new Error(`Failed to estimate borrow: ${error.message}`);
    }
  }
}
