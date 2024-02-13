import { ECDSASignature } from "../Utils/ECDSASignature";
import { UAddress } from "../Utils/UAddress";

/**
 * The Wallets abstract class defines a standard interface for cryptocurrency wallets,
 * encompassing key management, digital signature generation, and address retrieval.
 * 
 */
export abstract class Wallets {
     /**
     * An abstract getter that must be implemented to return the provider name.
     */
    abstract get PROVIDER(): string;

    /**
     * Abstract method to asynchronously retrieve the public key for a given key identifier.
     * @param KeyId The identifier for the key.
     * @returns Promise that resolves to the public key as a Buffer.
     */
    abstract getPublickey(KeyId: string): Promise<Buffer>;

    /**
     * Abstract method for signing a digest with the specified key identifier using ECDSA.
     * @param account An object containing the KeyId and optional address of the signing account.
     * @param digest The message digest to sign.
     * @param chainId Optional chain ID to specify the blockchain network.
     * @returns Promise that resolves to an ECDSASignature object.
     */
    abstract ecsign(account: { KeyId: string, address?: Buffer }, digest: Buffer, chainId?: bigint): Promise<ECDSASignature>;

    /**
     * Retrieves the address associated with a given key identifier.
     * @param KeyId The identifier for the key.
     * @returns Promise that resolves to the address as a Buffer.
     */
    async getAddress(KeyId: string) : Promise<Buffer>  {
        return UAddress.fromPublickey(await this.getPublickey(KeyId)).getAddress();
    }

    /**
     * Retrieves the hexadecimal string representation of the address for a given key identifier.
     * @param KeyId The identifier for the key.
     * @returns Promise that resolves to the address as a hexadecimal string.
     */
    async getAddressHex(KeyId: string) : Promise<string>  {
        return UAddress.fromPublickey(await this.getPublickey(KeyId)).getAddressHex();
    }
}