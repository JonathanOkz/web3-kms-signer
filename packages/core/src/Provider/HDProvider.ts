import { ECDSASignature } from "../Types/ECDSASignature"

/**
 * An abstract class designed to define the interface for hierarchical deterministic (HD) wallet providers.
 * It outlines the essential functionalities that any subclass should implement.
 * 
 */
export abstract class HDProvider {
    /**
     * Abstract method to retrieve the public key for a given key identifier.
     * keyId should follow a BIP44 derivation path format.
     * 
     * @param {string} keyId - The derivation path for the key.
     * @returns {Buffer} The public key associated with the keyId.
     */
    abstract getPublickey(KeyId: string) : Buffer

    /**
     * Abstract method to sign a digest using the ECDSA (Elliptic Curve Digital Signature Algorithm)
     * with a private key derived from the specified keyId. This method may include an optional chainId
     * to support EIP-155 signatures, preventing replay attacks across different chains.
     * 
     * @param {string} keyId - The derivation path for the key used to sign.
     * @param {Buffer} digest - The message digest to sign.
     * @param {bigint} [chainId] - Optional chain ID to specify the blockchain network.
     * @returns {ECDSASignature} The signature object containing `r`, `s`, and `v` components.
     */
    abstract ecsign(keyId: string, digest: Buffer, chainId?: bigint) : ECDSASignature
}