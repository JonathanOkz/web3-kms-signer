import * as ethutil from "@ethereumjs/util";
import { UAddress } from "./UAddress";
import { UBuffer } from "./UBuffer";

export class UPublickey {
    private publickey: Buffer;
    
    protected constructor(input: Buffer) {
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