import * as ethutil from "@ethereumjs/util";
import { ethers } from "ethers";
import { UPublickey, ECDSASignature, HDProvider } from "@web3-kms-signer/core";

/**
 * A class for managing Ethereum-based hierarchical deterministic wallets. It supports key generation,
 * derivation, and ECDSA signing using BIP44 paths. It uses a mnemonic phrase to initialize and
 * generate wallet keys.
 * 
 * The class utilizes ethers.js for underlying blockchain interactions and key management.
 */
export class HDProviderNode extends HDProvider {
    private nodeWallet: ethers.HDNodeWallet;

    constructor(phrase: string) {
        super();
        this.nodeWallet = ethers.HDNodeWallet.fromPhrase(phrase);
    }

    /**
     * Retrieves the public key corresponding to a given key identifier (KeyId) as a Buffer.
     *
     * This method first derives the private key associated with the specified keyId by calling
     * the `getPrivateKey` method.
     *
     * @param {string} keyId - The BIP44 key derivation path used to derive the private key.
     * @returns {Buffer} The derived public key as a Buffer, ready for cryptographic uses.
     * @throws {Error} Throws an error if the private key cannot be derived.
     */
    public getPublickey(keyId: string) : Buffer  {
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
    public ecsign(KeyId: string, digest: Buffer, chainId?: bigint) : ECDSASignature {
        return ethutil.ecsign(digest, this.getPrivatekey(KeyId), chainId);
    }

    /**
     * Retrieves the private key associated with a given key identifier (KeyId) as a Buffer.
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