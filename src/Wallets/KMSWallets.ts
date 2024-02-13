import { KMSProvider } from "../Provider/KMSProvider/KMSProvider";
import { Wallets } from "./Wallets";
import { ECDSASignature } from "../Utils/ECDSASignature";
import { USignatureECDSA } from "../Utils/USignatureECDSA";
import { UPublickey } from "../Utils/UPublickey";

/**
 * The KMSWallets class extends the abstract Wallets class, offering a specialized implementation
 * for managing wallets through Key Management Services (KMS). It utilizes a KMSProvider for
 * cryptographic operations such as public key retrieval and digital signature creation. This class
 * facilitates dynamic integration with different KMS providers, enabling secure key management.
 * 
 */
export class KMSWallets extends Wallets {
    private provider: KMSProvider

    constructor(provider: KMSProvider) {
        super();
        this.provider = provider;
    }

    /**
     * Returns the provider's name, prefixed with 'KMS_WALLETS_' to indicate the type of wallet.
     * @returns The name of the provider as a string.
     */
    get PROVIDER(): string {
        return `KMS_WALLETS_${this.provider.constructor.name}`
    }

    /**
     * Retrieves the public key for a given key identifier, processing the DER-encoded key
     * from the KMSProvider into a usable format.
     * @param KeyId The identifier of the key.
     * @returns A Promise that resolves to the public key as a Buffer.
     */
    public async getPublickey(KeyId: string) : Promise<Buffer>  {
        const derPublickey = await this.provider.getDerPublickey(KeyId);
        return UPublickey.fromPublickeyDerEncoding(derPublickey).getPublickey();
    }

    /**
     * Signs a digest with a private key identified by KeyId, using the KMSProvider.
     * @param account An object containing the KeyId and optional address of the signing account.
     * @param digest The digest to be signed.
     * @param chainId Optional chain ID to specify the blockchain network.
     * @returns A Promise that resolves to an ECDSASignature object.
     */
    public async ecsign(account: { KeyId: string, address?: Buffer }, digest: Buffer, chainId?: bigint) : Promise<ECDSASignature> {

        const {r, s} = USignatureECDSA.decodeRS(await this.provider.signDigest(account.KeyId, digest));

        const address = (!account.address) ? await this.getAddress(account.KeyId) : account.address;
        const v = USignatureECDSA.calculateV(address, digest, r, s, chainId);
        if (v == BigInt(-1)) {
            throw new Error("ServerKMS: v is invalid.");
        }

        return {r, s, v}
    }
}