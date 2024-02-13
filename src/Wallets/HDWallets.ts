import { HDProvider } from "../Provider/HDProvider/HDProvider";
import { ECDSASignature } from "../Utils/ECDSASignature";
import { Wallets } from "./Wallets";

/**
 * The HDWallets class extends the abstract Wallets class, providing a concrete implementation
 * for managing hierarchical deterministic (HD) wallets. It leverages an HDProvider for
 * cryptographic operations including public key retrieval and ECDSA signing. The class
 * supports dynamic provider assignment, allowing for flexible integration with various
 * HD wallet strategies. Its primary functions include obtaining public keys and signing
 * digests with keys derived from specified BIP44 paths.
 *
 */
export class HDWallets extends Wallets {
    private provider: HDProvider

    constructor(provider: HDProvider) {
        super();
        this.provider = provider;
    }

    /**
     * Returns the provider's name, prefixed with 'HD_WALLETS_' to indicate the type of wallet.
     * @returns The name of the provider as a string.
     */
    get PROVIDER(): string {
        return `HD_WALLETS_${this.provider.constructor.name}`
    }

    /**
     * Retrieves the public key for a given key identifier, using the associated HDProvider.
     * @param KeyId The identifier for the key.
     * @returns Promise resolving to the public key as a Buffer.
     */
    public async getPublickey(KeyId: string) : Promise<Buffer> {
        return this.provider.getPublickey(KeyId);
    }

    /**
     * Signs a digest with the specified key identifier and optional chain ID, using the associated HDProvider.
     * @param KeyId The identifier for the key.
     * @param digest The message digest to sign.
     * @param chainId Optional chain ID to specify the blockchain network.
     * @returns Promise resolving to an ECDSASignature.
     */
    public async ecsign(account: { KeyId: string }, digest: Buffer, chainId?: bigint) : Promise<ECDSASignature> {
        return this.provider.ecsign(account.KeyId, digest, chainId);
    }
}