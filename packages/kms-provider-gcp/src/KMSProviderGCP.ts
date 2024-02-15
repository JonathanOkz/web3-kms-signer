import { KMSProvider } from "@web3-kms-signer/core";
import { KeyManagementServiceClient } from "@google-cloud/kms";
import crypto from 'crypto';
import crc32c from 'fast-crc32c';
import { v4 as uuidv4 } from 'uuid';

interface KeyManagementServiceClientPath {
    projectId: string;
    locationId: string;
    keyRingId: string;
}

/**
 * A class who extends the abstract KMSProvider to implement key management and cryptographic
 * operations using Google Cloud Platform's Key Management Service (KMS). It provides methods
 * to retrieve DER-encoded public keys, sign digests with private keys managed by GCP KMS,
 * and manage cryptographic keys and key rings within GCP KMS.
 * 
 */
export class KMSProviderGCP extends KMSProvider {
    private kms: KeyManagementServiceClient;
    private path?: KeyManagementServiceClientPath

    constructor(config: {keyFilename: string}) {
        super();
        this.kms = new KeyManagementServiceClient({keyFilename: config.keyFilename});
    }

    public setPath(path: KeyManagementServiceClientPath) {
        this.path = path;
    }

    /**
     * Retrieves the DER-encoded object as defined by ANS X9.62–2005.
     * @param keyId The gcp identifier of the key.
     * @returns Promise resolving to the DER-encoded public key.
     */
    async getDerPublickey(keyId: string) : Promise<Buffer>  {
        if (!this.path) {
            throw "this.path is undefined";
        }
        const pubKey = await this.kms.getPublicKey({name: this.kms.cryptoKeyVersionPath(this.path.projectId, this.path.locationId, this.path.keyRingId, keyId, '1')})
        if (!pubKey[0].pem) {
            throw new Error("GCPKMS: pubKey[0].pem is undefined.");
        }
        const p2 = crypto.createPublicKey(pubKey[0].pem);
        return p2.export({format:"der", type:"spki"});
    }

    /**
     * Signs a digest using a private key stored in GCP KMS, returning the signature.
     * @param keyId The gcp identifier of the key.
     * @param digest The digest to sign, as a Buffer.
     * @returns Promise resolving to the signature, as a Buffer.
     */
    async signDigest(keyId: string, digest: Buffer) : Promise<Buffer> {
        if (!this.path) {
            throw "this.path is undefined";
        }
        const [signResponse] = await this.kms.asymmetricSign({
            name: this.kms.cryptoKeyVersionPath(this.path.projectId, this.path.locationId, this.path.keyRingId, keyId, '1'),
            digest: {
                sha256: digest
            },
            digestCrc32c: {
                value: crc32c.calculate(digest),
            }
        });
        if (!signResponse.signature || !signResponse.signatureCrc32c) {
            throw new Error("GCPKMS: signResponse is undefined.");
        }
        if (!signResponse.verifiedDigestCrc32c) {
            throw new Error('GCPKMS: request corrupted in-transit');
        }
        if (crc32c.calculate(Buffer.from(signResponse.signature)) !== Number(signResponse.signatureCrc32c.value)) {
            throw new Error('GCPKMS: response corrupted in-transit');
        }
        return Buffer.from(signResponse.signature);
    }

    /**
     * Asynchronously creates a new cryptographic key within a specified key ring in Google Cloud Platform's Key Management Service (GCP KMS).
     * This method allows for the specification of the protection level for the key, with options for hardware security module (HSM)
     * or software-based protection. It generates a unique identifier for the key, constructs the cryptographic key with the specified
     * protection level, and associates it with a key ring defined by the `path` property of the class instance.
     *
     * @param {'HSM' | 'SOFTWARE'} [protectionLevel='SOFTWARE'] - The desired protection level for the new cryptographic key.
     * @returns {Promise<string>} A promise that resolves to the unique identifier (UUID) of the newly created cryptographic key.
     * @throws {Error} Throws an error if the path to the key ring is undefined or if the key creation fails in GCP KMS.
     */
    async createKey(protectionLevel: 'HSM' | 'SOFTWARE' = 'SOFTWARE') : Promise<string> {
        if (!this.path) {
            throw "this.path is undefined";
        }
        const cryptoKeyId = uuidv4();
        const [key] = await this.kms.createCryptoKey({
            parent: this.kms.keyRingPath(this.path.projectId, this.path.locationId, this.path.keyRingId),
            cryptoKeyId: cryptoKeyId,
            cryptoKey: {
                purpose: 'ASYMMETRIC_SIGN',
                versionTemplate: {
                    algorithm: 'EC_SIGN_SECP256K1_SHA256',
                    protectionLevel: protectionLevel
                }
            }
        });
        if (!key.name) {
            throw new Error("GCPKMS: key.name not exist.");
        }
        return cryptoKeyId;
    }

    /**
     * Creates a new key ring in GCP KMS to organize crypto keys.
     * @param keyRingId The identifier for the new key ring.
     * @returns The ID of the created key ring.
     */
    async createKeyRing(keyRingId: string) {
        if (!this.path) {
            throw "this.path is undefined";
        }
        const [keyRing] = await this.kms.createKeyRing({
            parent: this.kms.locationPath(this.path.projectId, this.path.locationId),
            keyRingId: keyRingId,
        });
        if (!keyRing.name) {
            throw new Error("GCPKMS: keyRing.name not exist.");
        }
        return keyRingId;
    }
}