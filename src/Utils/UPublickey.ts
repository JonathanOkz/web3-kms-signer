import * as asn1js from "asn1js";
import * as ethutil from "@ethereumjs/util";
import { UAddress } from "./UAddress";
import { UBuffer } from "./UBuffer";

export class UPublickey {
    private publickey: Buffer;
    
    private constructor(input: Buffer) {
        this.publickey = input;
    }

    /******************
     * public getter
     */

    /**
    * Returns the wallet's public key.
    */
    public getPublickey(): Buffer {
        return this.publickey;
    }

    /**
     * Returns the wallet's public key as a "0x" prefixed hex
     */
    public getPublickeyHex(): string {
        return ethutil.bufferToHex(this.getPublickey()).toLowerCase();
    }

    /**
     * Returns the wallet's address.
     */
    public getAddress(): Buffer {
        return UAddress.fromPublickey(this.getPublickey()).getAddress();
    }

    /**
     * Returns the wallet's address as a "0x" prefixed hex
     */
    public getAddressHex(): string {
        return UAddress.fromPublickey(this.getPublickey()).getAddressHex();
    }

    /**
     * Returns the wallet's address as a "0x" prefixed hex checksummed
     * according to [EIP 55](https://github.com/ethereum/EIPs/issues/55).
     */
    public getChecksumAddress(): string {
        return UAddress.fromPublickey(this.getPublickey()).getChecksumAddress();
    }

    /******************
     * static
     */

    public static fromPublickeyDerEncoding(input: Buffer) {
        /**
         * Before calculating the Ethereum address, we need to get the raw value of the public key.
         * the input returns a DER-encoded X.509 public key, also known
         * asSubjectPublickeyInfo (SPKI), as defined in RFC 5280. 
         * Use an ASN1 library that allows us to define this as a schema as `OBJECT IDENTIFIER `
         * https://www.rfc-editor.org/rfc/rfc5480#section-2
         */
        const schema = new asn1js.Sequence({ value: [
            new asn1js.Sequence({ value: [new asn1js.ObjectIdentifier()] }),
            new asn1js.BitString({ name: "objectIdentifier" }),
        ]});
        const parsed = asn1js.verifySchema(input, schema);
        if (!parsed.verified) {
            throw new Error(`Publickey: failed to parse. ${parsed.result.error}`);
        }
        const objectIdentifier: ArrayBuffer = parsed.result.objectIdentifier.valueBlock.valueHex;

        /**
         * According to section 2.2 of RFC 5480, the first byte, 0x04 indicates that this is an uncompressed key.
         * We need to remove this byte for the public key to be correct. Once we delete the first byte, we get the
         * raw public key that can be used to calculate our Ethereum address.
         */
        const publickey = objectIdentifier.slice(1); // remove 0x04

        return new UPublickey(Buffer.from(publickey));
    }

    public static fromPrivatekey(input: Buffer | string) {
        return new UPublickey(ethutil.privateToPublic(UBuffer.bufferOrHex(input)));
    }

    public static fromPublickey(input: Buffer | string) {
        return new UPublickey(UBuffer.bufferOrHex(input));
    }

    public static fromVRS(digest: Buffer, v: bigint, r: Buffer, s: Buffer, chainId?: bigint) {
        return new UPublickey(ethutil.ecrecover(digest, v, r, s, chainId));
    }
}