"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
const util_1 = require("@ethereumjs/util");
const tx_1 = require("@ethereumjs/tx");
const common_1 = require("@ethereumjs/common");
const UBuffer_1 = require("./Utils/UBuffer");
/**
 * The Signer class provides functionality to sign Ethereum transactions and messages using
 * private keys managed by a specified Wallets instance. It supports signing arbitrary messages,
 * hashed digests, and transaction data, preparing them for blockchain submission. The class
 * can be configured with a specific blockchain network through an optional chain ID, allowing
 * it to sign transactions according to network-specific parameters. It abstracts the complexities
 * of transaction serialization and signature generation, streamlining the process of creating
 * secure and valid blockchain transactions.
 *
 */
class Signer {
    /**
     * Constructs a Signer instance with a specified Wallets instance and an optional chain ID.
     * The chain ID is used to configure the network for transactions.
     * @param wallets An instance of Wallets for key management and signing.
     * @param chainId Optional chain ID to specify the blockchain network.
     */
    constructor(wallets, chainId) {
        this.wallets = wallets;
        this.common = (chainId) ? common_1.Common.custom({ chainId: chainId, networkId: chainId }) : undefined;
    }
    /**
     * Signs an Ethereum transaction with the specified account's.
     * @param account An object containing the keyId and optional address of the signing account.
     * @param txData The transaction data to sign.
     * @returns A Promise that resolves to the serialized transaction as a '0x'-prefixed hex string.
     */
    async signTransaction(account, txData) {
        const digest = tx_1.TransactionFactory.fromTxData(txData, { common: this.common }).getMessageToSign();
        const { r, s, v } = await this.wallets.ecsign(account, digest, this.common?.chainId());
        const signed = tx_1.TransactionFactory.fromTxData({ ...txData, r, s, v }, { common: this.common });
        return (0, util_1.addHexPrefix)(signed.serialize().toString('hex'));
    }
    /**
     * Signs an arbitrary message using the specified account's. The message is first
     * hashed and then signed.
     * @param account An object containing the keyId and optional address of the signing account.
     * @param message The message to sign.
     * @returns A Promise that resolves to the '0x'-prefixed hex string of the signature.
     */
    async signMessage(account, message) {
        const digest = (0, util_1.hashPersonalMessage)(Buffer.from(message));
        return this.signDigest(account, digest);
    }
    /**
     * Signs a digest (hashed message) using the specified account's.
     * @param account An object containing the keyId and optional address of the signing account.
     * @param digest The digest to sign, either as a Buffer or a '0x'-prefixed hex string.
     * @returns A Promise that resolves to the '0x'-prefixed hex string of the signature.
     */
    async signDigest(account, digest) {
        const { r, s, v } = await this.wallets.ecsign(account, UBuffer_1.UBuffer.bufferOrHex(digest));
        // Convert to unsigned hex strings and pad to ensure consistent length
        const rStr = (0, util_1.toUnsigned)((0, util_1.fromSigned)(r)).toString('hex').padStart(64, '0');
        const sStr = (0, util_1.toUnsigned)((0, util_1.fromSigned)(s)).toString('hex').padStart(64, '0');
        const vStr = (0, util_1.bigIntToBuffer)(v).toString('hex').padStart(2, '0');
        // Concatenate the padded strings and add hex prefix
        return (0, util_1.addHexPrefix)(rStr.concat(sStr, vStr));
    }
}
exports.Signer = Signer;
//# sourceMappingURL=Signer.js.map