/// <reference types="node" />
export declare class UPublickey {
    private publickey;
    protected constructor(input: Buffer);
    /******************
     * public getter
     */
    /**
    * Returns the wallet's public key.
    */
    getPublickey(): Buffer;
    /**
     * Returns the wallet's public key as a "0x" prefixed hex
     */
    getPublickeyHex(): string;
    /**
     * Returns the wallet's address.
     */
    getAddress(): Buffer;
    /**
     * Returns the wallet's address as a "0x" prefixed hex
     */
    getAddressHex(): string;
    /**
     * Returns the wallet's address as a "0x" prefixed hex checksummed
     * according to [EIP 55](https://github.com/ethereum/EIPs/issues/55).
     */
    getChecksumAddress(): string;
    /******************
     * static
     */
    static fromPrivatekey(input: Buffer | string): UPublickey;
    static fromPublickey(input: Buffer | string): UPublickey;
    static fromVRS(digest: Buffer, v: bigint, r: Buffer, s: Buffer, chainId?: bigint): UPublickey;
}
//# sourceMappingURL=UPublickey.d.ts.map