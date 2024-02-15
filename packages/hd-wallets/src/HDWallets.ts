import * as ethutil from "@ethereumjs/util";
import { ethers } from "ethers";
import { UPublickey, Wallets, ECDSASignature } from "@web3-kms-signer/core";

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
    private nodeWallet: ethers.HDNodeWallet;

    constructor(phrase: string) {
        super();
        this.nodeWallet = ethers.HDNodeWallet.fromPhrase(phrase);
    }

    /**
     * Returns the provider's name, prefixed with 'HD_WALLETS_' to indicate the type of wallet.
     * @returns The name of the provider as a string.
     */
    get PROVIDER(): string {
        return `HD_WALLETS`
    }

    /**
     * Retrieves the public key corresponding to a given key identifier (keyId) as a Buffer.
     *
     * This method first derives the private key associated with the specified keyId by calling
     * the `getPrivateKey` method.
     *
     * @param {string} keyId - The BIP44 key derivation path used to derive the private key.
     * @returns {Buffer} The derived public key as a Buffer, ready for cryptographic uses.
     * @throws {Error} Throws an error if the private key cannot be derived.
     */
    public async getPublickey(keyId: string) : Promise<Buffer>  {
        return UPublickey.fromPrivatekey(this.getPrivatekey(keyId)).getPublickey();
    }

    /**
     * Signs a given digest using the ECDSA (Elliptic Curve Digital Signature Algorithm) with a private
     * key derived from a specified key identifier (keyId).
     *
     * @param {string} keyId - The BIP44 key derivation path used to derive the private key for signing.
     * @param {Buffer} digest - The message digest to sign. This should be a 32-byte hash.
     * @param {bigint} [chainId] - Optional chain ID to specify the blockchain network.
     * @returns {ECDSASignature} An object containing the components of the ECDSA signature (`r`, `s`, `v`).
     * @throws {Error} Throws an error if the signing process fails or if the private key cannot be derived.
     */
    public async ecsign(account: { keyId: string }, digest: Buffer, chainId?: bigint) : Promise<ECDSASignature> {
        return ethutil.ecsign(digest, this.getPrivatekey(account.keyId), chainId);
    }

    /**
     * Retrieves the private key associated with a given key identifier (keyId) as a Buffer.
     *
     * This method derives the private key from a node wallet using the provided keyId, which
     * represents a BIP44 key derivation path.
     *
     * @param {string} keyId - The BIP44 key derivation path used to derive the private key.
     * @returns {Buffer} The derived private key as a Buffer, suitable for cryptographic operations.
     * @throws {Error} Throws an error if the private key cannot be derived or processed correctly.
     */
    private getPrivatekey(keyId: string) : Buffer {
        const privateKey = this.nodeWallet.derivePath(keyId).privateKey
        return Buffer.from(privateKey.substring(2,66), "hex");
    }
}