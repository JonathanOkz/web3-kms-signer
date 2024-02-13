import * as asn1js from "asn1js";
import BN from "bn.js";
import { UPublickey } from "./UPublickey";

export class USignatureECDSA {

    /**
     * According to EIP-2, allowing transactions with any s value (from 0 to the max number on the secp256k1n curve),
     * opens a transaction malleability concern. This is why a signature with a value of s > secp256k1n / 2 (greater than half of the curve) is invalid,
     * i.e. it is a valid ECDSA signature but from an Ethereum perspective the signature is on the dark side of the curve.
     * The code above solves this by checking if the value of s is greater than secp256k1n / 2 (line 43). If that’s the case,
     * we’re on the dark side of the curve. We need to invert s (line 46) in order to get a valid Ethereum signature.
     * This works because the value of s does not define a distinct point on the curve. The value can be +s or -s,
     * either signature is valid from an ECDSA perspective.
     */
    public static decodeRS(signature: Buffer) : { r: Buffer, s: Buffer } {
        /**
         * According to section 2.2.3 of RFC 3279 this function expects to find two integers r and s
         * in the signature that will be returned as two BigNumber (BN.js) objects.
         */
        const schema = new asn1js.Sequence({ value: [
            new asn1js.Integer({ name: "r" }),
            new asn1js.Integer({ name: "s" }),
        ]});
        const parsed = asn1js.verifySchema(signature, schema);
        if (!parsed.verified) {
            throw new Error(`USignatureECDSA: failed to parse. ${parsed.result.error}`);
        }

        /**
         * The result represents a point on the elliptic curve where r represents the x coordinate and s represents y.
         */
        const r = new BN(Buffer.from(parsed.result.r.valueBlock.valueHex));
        let   s = new BN(Buffer.from(parsed.result.s.valueBlock.valueHex));

        /**
         * Because of EIP-2 not all elliptic curve signatures are accepted, the value of s needs to be SMALLER than half of the curve
         */
        let secp256k1N = new BN("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16); // max value on the curve
        let secp256k1halfN = secp256k1N.div(new BN(2)); // half of the curve
        if (s.gt(secp256k1halfN)) {
            // if s is great than half of the curve, we need to invert it.
            // According to EIP2 https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2.md
            s = secp256k1N.sub(s);
        }
        return { r: r.toBuffer(), s: s.toBuffer() }
    }

    /**
     * candidate_1 = (chainId * 2 + 35) || 27
     * candidate_2 = (chainId * 2 + 36) || 28
     * v is the recovery id and it can be one of two possible values: `candidate_1` or `candidate_2`.
     * v is typically created during Ethereum’s signing process and stored alongside the signature. Unfortunately,
     * we did not use an Ethereum function to generate the signature which is why we do not know the value of v yet.
     * 
     * Using Ethereum’s ecrecover(sig, v, r, s, chainId) function, we can recover the public key from an Ethereum signature.
     * Since we have the Ethereum account address, we already know what the outcome of this equation needs to be.
     * All we have to do is call this function twice, once with v = `candidate_1`, and in case that does not give us
     * the right address, a second time with v = `candidate_2`. One of the two calls should result in the Eth address.
     */
    public static calculateV(address: Buffer, digest: Buffer, r: Buffer, s: Buffer, chainId?: bigint) : bigint {
        /**
         * This is the function to find the right v value
         * There are two matching signatues on the elliptic curve
         * we need to find the one that matches to our public key
         * it can be v = `candidate_1` or v = `candidate_2`
         */
        const candidate_1 = (chainId) ? (chainId * BigInt(2) + BigInt(35)) : BigInt(27);
        const candidate_2 = (chainId) ? (chainId * BigInt(2) + BigInt(36)) : BigInt(28);
        if (Buffer.compare(address, UPublickey.fromVRS(digest, candidate_1, r, s, chainId).getAddress()) === 0) {
            return candidate_1;
        } else if (Buffer.compare(address, UPublickey.fromVRS(digest, candidate_2, r, s, chainId).getAddress()) === 0) {
            return candidate_2;
        } else {
            return BigInt(-1);
        }
    }
}