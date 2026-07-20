import { Injectable, UnauthorizedException } from '@nestjs/common';
import { utils as ethersUtils } from 'ethers';

/**
 * Proves the caller controls the wallet address they claim, by recovering the
 * signer from an EIP-191 (personal_sign) signature.
 *
 * The message is rebuilt server-side from `walletAddress` + `issuedAt` rather
 * than trusting a client-supplied string, so a caller cannot get a signature
 * over one payload and submit it as proof for another.
 *
 * IMPORTANT: the template below must stay byte-identical to the frontend's
 * (ui/components/shared/user-signup-dialog.tsx) or every signature fails.
 */
@Injectable()
export class WalletSignatureVerifier {
  /** How long a signed message stays valid. Bounds the replay window. */
  private static readonly MAX_AGE_MS = 5 * 60 * 1000;
  /** Tolerance for client clocks running ahead of the server. */
  private static readonly CLOCK_SKEW_MS = 60 * 1000;

  static buildMessage(walletAddress: string, issuedAt: string): string {
    return [
      'Welcome to OceanFin!',
      '',
      `Wallet Address: ${walletAddress}`,
      `Timestamp: ${issuedAt}`,
      '',
      'Please sign this message to verify wallet ownership.',
    ].join('\n');
  }

  /**
   * Throws UnauthorizedException unless `signature` is a valid signature of the
   * canonical message by `walletAddress`, and `issuedAt` is recent.
   */
  verify(walletAddress: string, issuedAt: string, signature: string): void {
    this.assertFresh(issuedAt);

    const message = WalletSignatureVerifier.buildMessage(walletAddress, issuedAt);

    let recovered: string;
    try {
      recovered = ethersUtils.verifyMessage(message, signature);
    } catch {
      // Malformed signature — treat the same as a wrong one, no detail leaked.
      throw new UnauthorizedException('Invalid wallet signature');
    }

    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new UnauthorizedException('Invalid wallet signature');
    }
  }

  private assertFresh(issuedAt: string): void {
    const signedAt = Date.parse(issuedAt);
    if (Number.isNaN(signedAt)) {
      throw new UnauthorizedException('Invalid signature timestamp');
    }

    const now = Date.now();
    if (signedAt > now + WalletSignatureVerifier.CLOCK_SKEW_MS) {
      throw new UnauthorizedException('Signature timestamp is in the future');
    }
    if (now - signedAt > WalletSignatureVerifier.MAX_AGE_MS) {
      throw new UnauthorizedException('Signature has expired, please sign again');
    }
  }
}
