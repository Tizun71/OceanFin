import { borrow } from "@/api/hydration/borrow";
import { setUserEmode } from "@/api/hydration/set-user-emode";
import { supply } from "@/api/hydration/supply";
import { swap } from "@/api/hydration/swap";
import { Step } from "@/types/strategy.type";
import { EMODE_CATEGORY, STEP_TYPE } from "@/utils/constant";

export const buildStepTx = async (step: Step, userAddress: string) => {
    switch (step.type) {
        case STEP_TYPE.JOIN_STRATEGY:
            return swap(step.tokenIn!.assetId, step.tokenOut!.assetId, step.tokenIn!.amount!.toString(), userAddress);

        case STEP_TYPE.SWAP:
            return swap(step.tokenIn!.assetId, step.tokenOut!.assetId, step.tokenIn!.amount!.toString(), userAddress);

        case STEP_TYPE.SUPPLY:
            return supply(step.tokenIn!.assetId, step.tokenIn!.amount!.toString(), userAddress);

        case STEP_TYPE.BORROW:
            return borrow(step.tokenOut!.assetId, step.tokenOut!.amount!.toString(), userAddress);

        case STEP_TYPE.ENABLE_BORROWING:
        break;

        case STEP_TYPE.ENABLE_E_MODE:
            return setUserEmode(EMODE_CATEGORY.DOT_CORRELATED, userAddress);

        default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
}