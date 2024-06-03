"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPublickey = void 0;
const tslib_1 = require("tslib");
const ethutil = tslib_1.__importStar(require("@ethereumjs/util"));
const UAddress_1 = require("./UAddress");
const UBuffer_1 = require("./UBuffer");
class UPublickey {
    constructor(input) {
        this.publickey = input;
    }
    /******************
     * public getter
     */
    /**
    * Returns the wallet's public key.
    */
    getPublickey() {
        return this.publickey;
    }
    /**
     * Returns the wallet's public key as a "0x" prefixed hex
     */
    getPublickeyHex() {
        return ethutil.bufferToHex(this.getPublickey()).toLowerCase();
    }
    /**
     * Returns the wallet's address.
     */
    getAddress() {
        return UAddress_1.UAddress.fromPublickey(this.getPublickey()).getAddress();
    }
    /**
     * Returns the wallet's address as a "0x" prefixed hex
     */
    getAddressHex() {
        return UAddress_1.UAddress.fromPublickey(this.getPublickey()).getAddressHex();
    }
    /**
     * Returns the wallet's address as a "0x" prefixed hex checksummed
     * according to [EIP 55](https://github.com/ethereum/EIPs/issues/55).
     */
    getChecksumAddress() {
        return UAddress_1.UAddress.fromPublickey(this.getPublickey()).getChecksumAddress();
    }
    /******************
     * static
     */
    static fromPrivatekey(input) {
        return new UPublickey(ethutil.privateToPublic(UBuffer_1.UBuffer.bufferOrHex(input)));
    }
    static fromPublickey(input) {
        return new UPublickey(UBuffer_1.UBuffer.bufferOrHex(input));
    }
    static fromVRS(digest, v, r, s, chainId) {
        return new UPublickey(ethutil.ecrecover(digest, v, r, s, chainId));
    }
}
exports.UPublickey = UPublickey;
//# sourceMappingURL=UPublickey.js.map