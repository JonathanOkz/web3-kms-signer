/**
 * An abstract class designed to define the interface for Key Management Service (KMS) providers.
 * It outlines the essential functionalities that any subclass should implement.
 * 
 * This class is intended for use in systems where cryptographic key management is centralized, and security
 * and compliance requirements necessitate the use of a KMS for sensitive operations like signing and key storage.
 * 
 */
export abstract class KMSProvider {
    /**
     * Abstract method to asynchronously retrieve the public key associated with a given KeyId.
     * This is intended for use with a Key Management Service (KMS), where keys are managed externally.
     * 
     * @param {string} KeyId - The identifier for the key.
     * @returns {Promise<Buffer>} A promise that resolves to the public key as a Buffer.
     */
    abstract getDerPublickey(KeyId: string) : Promise<Buffer>

    /**
     * Abstract method to asynchronously sign a given digest with the private key corresponding to the specified KeyId.
     * This method utilizes a Key Management Service (KMS) for the signing process, ensuring that the private key
     * does not need to be exposed.
     * 
     * @param {string} KeyId - The identifier for the key to be used for signing.
     * @param {Buffer} digest - The digest of the message to be signed.
     * @returns {Promise<Buffer>} A promise that resolves to the signature as a Buffer.
     */
    abstract signDigest(KeyId: string, digest: Buffer) : Promise<Buffer>
}