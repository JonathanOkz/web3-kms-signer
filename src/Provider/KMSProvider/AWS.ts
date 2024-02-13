import { KMSProvider } from "./KMSProvider";
import {
    KMSClient,
    SignCommand,
    GetPublicKeyCommand,
    KMSClientConfig,
    CreateKeyCommand,
  } from "@aws-sdk/client-kms";

/**
 * A class who extends the abstract KMSProvider to facilitate cryptographic operations using
 * Amazon Web Services (AWS) Key Management Service (KMS). It enables the retrieval of public keys,
 * signing of digests, and creation of new cryptographic keys within AWS KMS.
 * 
 */
export class AWS extends KMSProvider {
    private kms: KMSClient;

    constructor(config: KMSClientConfig) {
        super();
        this.kms = new KMSClient(config);
    }

    /**
     * Retrieves the DER-encoded object as defined by ANS X9.62–2005.
     * @param KeyId The aws identifier of the key.
     * @returns Promise resolving to the public key as a DER-encoded Buffer.
     */
    async getDerPublickey(KeyId: string) : Promise<Buffer>  {
        const key = await this.kms.send(new GetPublicKeyCommand({
            KeyId: KeyId
        }));
        if (!key.PublicKey) {
            throw new Error("AWSKMS: PublicKey is undefined.");
        }
        return Buffer.from(key.PublicKey);
    }

    /**
     * Signs a given digest using a private key stored in AWS KMS, identified by the given key ID.
     * @param KeyId The aws identifier of the key.
     * @param digest The digest of the message to sign.
     * @returns Promise resolving to the signature as a Buffer.
     */
    async signDigest(KeyId: string, digest: Buffer) : Promise<Buffer> {
        const response = await this.kms.send(new SignCommand({
            KeyId: KeyId,
            Message: digest,
            MessageType: "DIGEST",
            SigningAlgorithm: "ECDSA_SHA_256",
        }));
        if (!response.Signature) {
            throw new Error("AWSKMS: Signature is undefined.");
        }
        return Buffer.from(response.Signature);
    }

    /**
     * Creates a new cryptographic key in AWS KMS for signing and verification purposes.
     * @returns Promise resolving to the new key's ID.
     */
    async createKey() : Promise<string> {
        const response = await this.kms.send(new CreateKeyCommand({
            KeySpec: "ECC_SECG_P256K1",
            KeyUsage: "SIGN_VERIFY"
        }));
        if (!response.KeyMetadata?.KeyId) {
            throw new Error("AWSKMS: KeyId not exist.");
        }
        return response.KeyMetadata?.KeyId;
    }
}