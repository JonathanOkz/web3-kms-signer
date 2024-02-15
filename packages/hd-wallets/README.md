
# Web3 KMS Signer Library

The Web3 KMS Signer Library provides an efficient way to sign Ethereum transactions and messages using private keys managed by Key Management Services (KMS) like AWS and GCP, as well as supporting Hierarchical Deterministic (HD) wallets. It simplifies the complexities associated with transaction serialization and signature generation, facilitating the creation of secure and blockchain-compliant transactions.

Refer to this article for a more in-depth understanding : https://jonathanokz.medium.com/secure-an-ethereum-wallet-with-a-kms-provider-2914bd1e4341

## Features

- Sign Ethereum transactions and arbitrary messages.
- Support for KMS wallets (AWS KMS, GCP KMS) and HD wallets.
- Network-specific transaction signing for compatibility across different networks (support EIP-155 signatures).

## Installation

Install the Web3 KMS Signer Library using npm :

```bash
npm install @web3-kms-signer/core
```

For hd wallets :

```bash
npm install @web3-kms-signer/hd-wallets
npm install @web3-kms-signer/hd-provider-node
```

For kms wallets :

```bash
npm install @web3-kms-signer/kms-wallets
npm install @web3-kms-signer/kms-provider-aws
npm install @web3-kms-signer/kms-provider-gcp
```

## Usage

Set up the right `Provider` instance before signing transactions or messages. Choose a wallet type based on your requirements, such as KMS-based wallets or Hierarchical Deterministic (HD) wallets.

### KMS Provider

#### Using AWS KMS

```javascript
import { KMSProviderAWS } from "@web3-kms-signer/kms-provider-aws";

const awsConfig = {
    region: 'us-east-1',
    credentials: {
        accesskeyId: 'YOUR_AWS_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY'
    }
};

const kmsProvider = new KMSProviderAWS(awsConfig);

// If you haven't yet generated keys in AWS KMS, follow this step to create a new asymmetric signing key with the appropriate configurations.
const keyId = await kmsProvider.createKey();
```

#### Using GCP KMS

```javascript
import { KMSProviderGCP } from "@web3-kms-signer/kms-provider-gcp";

const gcpConfig = {
    keyFilename: "path/to/your/gcp/keyfile.json"
};
const kmsProvider = new KMSProviderGCP(gcpConfig);

// If you haven't yet generated key-ring in GCP KMS, follow this step :
// This step is required only once before beginning; afterwards, you'll just need the `key-ring-id`.
const keyRingId = await kmsProvider.createKeyRing("key-ring-id");

kmsProvider.setPath({
        projectId: "your-gcp-project-id",
        locationId: "your-gcp-location-id",
        keyRingId: keyRingId
    });

// If you haven't yet generated keys in GCP KMS, follow this step to create a new asymmetric signing key with the appropriate configurations.
const keyId = await kmsProvider.createKey();

// You can choose between 'HSM' and 'SOFTWARE' (default is 'SOFTWARE')
// HSM offer stronger security than software solutions, but are more expensive. The choice depends on your security needs and budget.
const keyId = await kmsProvider.createKey('HSM');
const keyId = await kmsProvider.createKey('SOFTWARE');
```

### HD Provider

```javascript
import { HDProviderNode } from "@web3-kms-signer/hd-provider-node";

const mnemonic = "relief material pool snap swing alien fiction total october mesh eyebrow idea";
const hdProvider = new HDProviderNode(mnemonic);

// With HD Wallets, the `keyId` is the derivation path, which specifies the route through which individual keys are generated from the master seed.
const keyId = "0'/0/1"

// A tool is available for generating derivation path easier.
// Please see various use cases below :
const keyId = UBIP44.keyId("4-67"); // => "4'/0/67"
const keyId = UBIP44.keyId("67"); // => "0'/0/67"
const keyId = UBIP44.keyId({account: 4, index: 67}); // => "4'/0/67"
const keyId = UBIP44.keyId({index: 67}); // => "0'/0/67"
```

## Signing Transactions and Messages

KMS wallets initialization

```javascript
import { Signer } from "@web3-kms-signer/core";
import { KMSWallets } from "@web3-kms-signer/kms-wallets";

const chainId = 3; // Ropsten
const signer = new Signer(new KMSWallets(kmsProvider), chainId);
```

HD wallets initialization

```javascript
import { Signer } from "@web3-kms-signer/core";
import { HDWallets } from "@web3-kms-signer/hd-wallets";

const chainId = 3; // Ropsten
const signer = new Signer(new HDWallets(hdProvider), chainId);
```

Signing Transactions

```javascript
const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ keyId: 'keyId' }, txData);
```

Signing Messages

```javascript
const message = "hello world !";
const signedMessage = await signer.signMessage({ keyId: 'keyId' }, message);
```

## Complete implementation to sign and send transactions on Blockchain

### KMS implementation

#### Using AWS KMS

```javascript
import { Signer } from "@web3-kms-signer/core";
import { KMSWallets } from "@web3-kms-signer/kms-wallets";
import { KMSProviderAWS } from "@web3-kms-signer/kms-provider-aws";
import  web3  from  "web3";

const awsConfig = {
    region: 'us-east-1',
    credentials: {
        accesskeyId: 'YOUR_AWS_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY'
    }
};
const kmsProvider = new KMSProviderAWS(awsConfig);

const chainId = 3; // Ropsten
const signer = new Signer(new KMSWallets(kmsProvider), chainId);

const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ keyId: 'aws keyId' /*defined before*/ }, txData);

web3.eth.sendSignedTransaction(signedTx)
.on('confirmation', (confirmationNumber : number, receipt : any) => {
	console.log("confirmation: " + confirmationNumber);
}).on('receipt', (txReceipt : any) => {
	console.log("signAndSendTx txReceipt. Tx Address: " + txReceipt.transactionHash);
}).on('error', error  => {
	console.error("error: " + error);
});
```

#### Using GCP KMS

```javascript
import { Signer } from "@web3-kms-signer/core";
import { KMSWallets } from "@web3-kms-signer/kms-wallets";
import { KMSProviderGCP } from "@web3-kms-signer/kms-provider-gcp";
import  web3  from  "web3";

const gcpConfig = {
    keyFilename: 'path/to/your/gcp/keyfile.json'
};
const kmsProvider = new KMSProviderGCP(gcpConfig);
kmsProvider.setPath({
        projectId: 'your-gcp-project-id',
        locationId: 'your-gcp-location-id',
        keyRingId: 'key-ring-id' // defined before
    });

const chainId = 3; // Ropsten
const signer = new Signer(new KMSWallets(kmsProvider), chainId);

const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ keyId: 'gcp keyId' /*defined before*/ }, txData);

web3.eth.sendSignedTransaction(signedTx)
.on('confirmation', (confirmationNumber : number, receipt : any) => {
	console.log("confirmation: " + confirmationNumber);
}).on('receipt', (txReceipt : any) => {
	console.log("signAndSendTx txReceipt. Tx Address: " + txReceipt.transactionHash);
}).on('error', error  => {
	console.error("error: " + error);
});
```

### HD implementation

```javascript
import { Signer } from "@web3-kms-signer/core";
import { HDWallets } from "@web3-kms-signer/hd-wallets";
import { HDProviderNode } from "@web3-kms-signer/hd-provider-node";
import  web3  from  "web3";

const mnemonic = "relief material pool snap swing alien fiction total october mesh eyebrow idea";
const hdProvider = new HDProviderNode(mnemonic);

const chainId = 3; // Ropsten
const signer = new Signer(new HDWallets(hdProvider), chainId);

const txData = {
    nonce: '0x00', // Replace with actual nonce
    gasPrice: '0x09184e72a000', // Replace with actual gas price
    gasLimit: '0x2710', // Replace with actual gas limit
    to: '0x0000000000000000000000000000000000000000', // Replace with recipient address
    value: '0x00', // Amount to send
    data: '0x0', // Data payload if any
};

const signedTx = await signer.signTransaction({ keyId: 'derivation path' }, txData);

web3.eth.sendSignedTransaction(signedTx)
.on('confirmation', (confirmationNumber : number, receipt : any) => {
	console.log("confirmation: " + confirmationNumber);
}).on('receipt', (txReceipt : any) => {
	console.log("signAndSendTx txReceipt. Tx Address: " + txReceipt.transactionHash);
}).on('error', error  => {
	console.error("error: " + error);
});
```

## Complete implementation to sign a message

### KMS implementation

#### Using AWS KMS

```javascript
import { Signer } from "@web3-kms-signer/core";
import { KMSWallets } from "@web3-kms-signer/kms-wallets";
import { KMSProviderAWS } from "@web3-kms-signer/kms-provider-aws";

const awsConfig = {
    region: 'us-east-1',
    credentials: {
        accesskeyId: 'YOUR_AWS_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_AWS_SECRET_ACCESS_KEY'
    }
};
const kmsProvider = new KMSProviderAWS(awsConfig);

const signer = new Signer(new KMSWallets(kmsProvider));
const signedMessage = await signer.signMessage({ keyId: 'keyId' }, "my message");
```

#### Using GCP KMS

```javascript
import { Signer } from "@web3-kms-signer/core";
import { KMSWallets } from "@web3-kms-signer/kms-wallets";
import { KMSProviderGCP } from "@web3-kms-signer/kms-provider-gcp";

const gcpConfig = {
    keyFilename: 'path/to/your/gcp/keyfile.json'
};
const kmsProvider = new KMSProviderGCP(gcpConfig);
kmsProvider.setPath({
        projectId: 'your-gcp-project-id',
        locationId: 'your-gcp-location-id',
        keyRingId: 'key-ring-id' // defined before
    });

const signer = new Signer(new KMSWallets(kmsProvider));
const signedMessage = await signer.signMessage({ keyId: 'keyId' }, "my message");

```

### HD implementation

```javascript
import { Signer } from "@web3-kms-signer/core";
import { HDWallets } from "@web3-kms-signer/hd-wallets";
import { HDProviderNode } from "@web3-kms-signer/hd-provider-node";

const mnemonic = "relief material pool snap swing alien fiction total october mesh eyebrow idea";
const hdProvider = new HDProviderNode(mnemonic);

const signer = new Signer(new HDWallets(hdProvider));
const signedMessage = await signer.signMessage({ keyId: 'keyId' }, "my message");
```

## Security Best Practices

Ensuring the security of cryptographic keys and transactions is paramount in the context of blockchain applications. This section outlines security best practices for using Key Management Services (KMS) and Hierarchical Deterministic (HD) wallets with the Web3 KMS Signer Library.

### KMS Security

**Key Management Services** offer robust mechanisms for managing cryptographic keys in a secure, centralized manner. Here's how to maximize security when using KMS:

1. **Access Control**: Restrict access to your KMS keys by defining precise IAM policies. Only grant necessary permissions to the roles or users that require them to perform their job functions.

2. **Audit Logs**: Enable audit logging features such as AWS CloudTrail or Google Cloud Audit Logs. These services record API calls, including calls made to the KMS, providing valuable insights into usage patterns and potentially unauthorized access attempts.

3. **Key Rotation**: Take advantage of automatic key rotation features to change the cryptographic material of a key regularly. This practice limits the amount of data encrypted under a single key, reducing the impact of a potential compromise.

4. **Multi-Region Keys**: For critical applications, consider replicating keys across multiple regions. This approach enhances the availability and redundancy of your cryptographic keys.

### HD Wallet Security

**Hierarchical Deterministic (HD) Wallets** generate a tree of key pairs from a single seed, providing a streamlined way to manage multiple addresses and assets. Follow these practices to secure your HD wallets:

1. **Secure Seed Phrase**: The seed phrase is the root of all key pairs generated by an HD wallet. Store it securely in a password manager, and/or use a hardware security module (HSM). Avoid storing it in plaintext or online without encryption.

2. **Backup and Recovery**: Regularly back up your wallet's seed phrase and derivation paths. Use secure, encrypted backup solutions, and consider a physical backup (e.g., paper or metal backup) stored in a safe location.

3. **Separation of Concerns**: Use different accounts or derivation paths for different applications or purposes. This approach limits the risk to your assets if one account is compromised.

4. **Client-Side Operations**: Perform sensitive operations like seed phrase generation and key derivation client-side, in a secure, isolated environment. Never transmit your seed phrase or private keys over the network.

## Contributing

Contributions from the community are welcome ! For improvements or bug fixes, please submit a pull request or open an issue in the GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.