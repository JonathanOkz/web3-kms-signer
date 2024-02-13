import * as ethutil from "@ethereumjs/util";
import { ethers } from "ethers";
import { UPublickey } from "../../Utils/UPublickey";
import { ECDSASignature } from "../../Utils/ECDSASignature";
import { HDProvider } from "./HDProvider";

/**
 * A class for managing Ethereum-based hierarchical deterministic wallets. It supports key generation,
 * derivation, and ECDSA signing using BIP44 paths. It uses a mnemonic phrase to initialize and
 * generate wallet keys.
 * 
 * The class utilizes ethers.js for underlying blockchain interactions and key management.
 */
export class NodeWallet extends HDProvider {
    private nodeWallet: ethers.HDNodeWallet;

    constructor(phrase: string) {
        super();
        this.nodeWallet = ethers.HDNodeWallet.fromPhrase(phrase);
    }

    /**
     * Retrieves the public key corresponding to a given key identifier (KeyId) as a Buffer.
     *
     * This method first derives the private key associated with the specified KeyId by calling
     * the `getPrivateKey` method.
     *
     * @param {string} KeyId - The BIP44 key derivation path used to derive the private key.
     * @returns {Buffer} The derived public key as a Buffer, ready for cryptographic uses.
     * @throws {Error} Throws an error if the private key cannot be derived.
     */
    public getPublickey(KeyId: string) : Buffer  {
        return UPublickey.fromPrivatekey(this.getPrivatekey(KeyId)).getPublickey();
    }

    /**
     * Signs a given digest using the ECDSA (Elliptic Curve Digital Signature Algorithm) with a private
     * key derived from a specified key identifier (KeyId).
     *
     * @param {string} KeyId - The BIP44 key derivation path used to derive the private key for signing.
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
     * This method derives the private key from a node wallet using the provided KeyId, which
     * represents a BIP44 key derivation path.
     *
     * @param {string} KeyId - The BIP44 key derivation path used to derive the private key.
     * @returns {Buffer} The derived private key as a Buffer, suitable for cryptographic operations.
     * @throws {Error} Throws an error if the private key cannot be derived or processed correctly.
     */
    private getPrivatekey(KeyId: string) : Buffer {
        const privateKey = this.nodeWallet.derivePath(KeyId).privateKey
        return Buffer.from(privateKey.substring(2,66), "hex");
    }
}