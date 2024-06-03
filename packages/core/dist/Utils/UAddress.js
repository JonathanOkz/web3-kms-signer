"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UAddress = void 0;
const tslib_1 = require("tslib");
const ethutil = tslib_1.__importStar(require("@ethereumjs/util"));
const UBuffer_1 = require("./UBuffer");
class UAddress {
    constructor(input) {
        this.address = input;
    }
    /**
     * Returns the wallet's address.
     */
    getAddress() {
        return this.address;
    }
    /**
     * Returns the wallet's address as a "0x" prefixed hex
     */
    getAddressHex() {
        return ethutil.bufferToHex(this.getAddress()).toLowerCase();
    }
    /**
     * Returns the wallet's address as a "0x" prefixed hex checksummed
     * according to [EIP 55](https://github.com/ethereum/EIPs/issues/55).
     */
    getChecksumAddress() {
        return ethutil.toChecksumAddress(this.getAddressHex());
    }
    /******************
     * static
     */
    static fromPublickey(input) {
        return new UAddress(ethutil.publicToAddress(UBuffer_1.UBuffer.bufferOrHex(input)));
    }
    static fromAddress(input) {
        return new UAddress(UBuffer_1.UBuffer.bufferOrHex(input));
    }
}
exports.UAddress = UAddress;
//# sourceMappingURL=UAddress.js.map