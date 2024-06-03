/// <reference types="node" />
export declare class UAddress {
    private address;
    private constructor();
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
    static fromPublickey(input: Buffer | string): UAddress;
    static fromAddress(input: Buffer | string): UAddress;
}
//# sourceMappingURL=UAddress.d.ts.map