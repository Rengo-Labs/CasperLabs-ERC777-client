import _ from "lodash";
import * as fs from "fs";
import {CLAccountHash, CLPublicKey, CLU8, Keys} from "casper-js-sdk";
import * as constants from "../consts/constants";

/**
 * Returns an on-chain account identifier.
 *
 * @param {Object} keyPair - Assymmetric keys of an on-chain account.
 * @return {String} Hexadecimal representation of an on-chain account identifier.
 */
export const getAccountHash = (keyPair) => {
  return Buffer.from(keyPair.accountHash()).toString("hex");
};

/**
 * Returns on-chain account information.
 * @param {Object} client - JS SDK client for interacting with a node.
 * @param {String} stateRootHash - Root hash of global state at a recent block.
 * @param {Object} keyPair - Assymmetric keys of an on-chain account.
 * @return {Object} On-chain account information.
 */
export const getAccountInfo = async (client, stateRootHash, keyPair) => {
  const accountHash = getAccountHash(keyPair);
  const { Account: accountInfo } = await client.nodeClient.getBlockState(
    stateRootHash,
    `account-hash-${accountHash}`,
    []
  );

  return accountInfo;
};

/**
 * Returns a value under an on-chain account's storage.
 * @param {Object} client - JS SDK client for interacting with a node.
 * @param {String} stateRootHash - Root hash of global state at a recent block.
 * @param {Object} keyPair - Assymmetric keys of an on-chain account.
 * @param {String} namedKey - A named key associated with an on-chain account.
 * @return {String} On-chain account storage item value.
 */
export const getAccountNamedKeyValue = async (
  client,
  stateRootHash,
  keyPair,
  namedKey
) => {
  const accountInfo = await getAccountInfo(client, stateRootHash, keyPair);
  const { key: contractHash } = _.find(accountInfo.namedKeys, (i) => {
    return i.name === namedKey;
  });

  return contractHash;
};

/**
 * Returns a binary as u8 array.
 * @param {String} pathToBinary - Path to binary file to be loaded into memory.
 * @return {Uint8Array} Byte array.
 */
export const getBinary = (pathToBinary) => {
  return new Uint8Array(fs.readFileSync(pathToBinary, null).buffer);
};

/**
 * Returns an ECC key pair mapped to an NCTL faucet account.
 * @param {String} pathToFaucet - Path to NCTL faucet directory.
 * @return {Array} An assymmetric key pair.
 */
export const getKeyPairOfContract = (pathToFaucet) => {
  return Keys.Ed25519.parseKeyFiles(
    `${pathToFaucet}/public_key.pem`,
    `${pathToFaucet}/secret_key.pem`
  );
};

/**
 * Returns global state root hash at current block.
 * @param {Object} client - JS SDK client for interacting with a node.
 * @return {String} Root hash of global state at most recent block.
 */
export const getStateRootHash = async (client) => {
  const {
    block: {
      header: { state_root_hash: stateRootHash },
    },
  } = await client.nodeClient.getLatestBlockInfo();

  return stateRootHash;
};

/**
 * Emits to stdout deploy details.
 * @param {String} deployHash - Identifer of dispatched deploy.
 */
export const logDetails = (contractName, deployHash, sessionGas, contractPath) => {
  console.log(`
---------------------------------------------------------------------
installed contract -> ${contractName}
... account = ${constants.PATH_TO_SOURCE_KEYS}
... deploy chain = ${constants.DEPLOY_CHAIN_NAME}
... deploy dispatch node = ${constants.DEPLOY_NODE_ADDRESS}
... deploy gas payment = ${sessionGas}
... deploy gas price = ${constants.DEPLOY_GAS_PRICE}
contract installation details:
... path = ${contractPath}
... deploy hash = ${deployHash}
---------------------------------------------------------------------
    `);
};

/***
 * to cast a string to array of CLU8
 * @param toBytes
 * @returns {CLU8[]}
 */
export const stringToArrayCLU8 = (toBytes) => {
  return Array.from(toBytes).map(v => new CLU8(v.charCodeAt(0)))
}

/***
 * Default accounts to perform the operations
 * @returns {{ownerHash: CLAccountHash, operatorHash: CLAccountHash, recipientHash: CLAccountHash}}
 */
export const getAccounts = () => {
  //**************************** for accounthash start*******************************/
  //This is the account used for deploying every contract
  const ownerKey = "0118a7fc9c6f062548b17ef4711acb522b497de36043e8086115e7252b3f9996be";
  const ownerHash = new CLAccountHash(
      CLPublicKey.fromHex(ownerKey).toAccountHash()
  );

  const operatorKey = "010e31a03ea026a8e375653573e0120c8cb96699e6c9721ae1ea98f896e6576ac3";
  const operatorHash = new CLAccountHash(
      CLPublicKey.fromHex(operatorKey).toAccountHash()
  );

  const recipientKey = "013b8bd1f2bfc7241d69e7cba488bfca52e29d2836e1a8e62035719aee0b81f5f1";
  const recipientHash = new CLAccountHash(
      CLPublicKey.fromHex(recipientKey).toAccountHash()
  );
  //**************************** for accounthash end*******************************/
  return {ownerHash, operatorHash, recipientHash}
}

/***
 * Default accounts to perform the operations
 * @returns {{ownerHash: CLAccountHash, operatorHash: CLAccountHash, recipientHash: CLAccountHash}}
 */
export const getPublicAccounts = () => {
  //**************************** for accounthash start*******************************/
  //This is the account used for deploying every contract
  const ownerKey = "0118a7fc9c6f062548b17ef4711acb522b497de36043e8086115e7252b3f9996be";
  const ownerHash = CLPublicKey.fromHex(ownerKey).toAccountHash();

  const secondKey = "013b8bd1f2bfc7241d69e7cba488bfca52e29d2836e1a8e62035719aee0b81f5f1";
  const secondHash =  CLPublicKey.fromHex(secondKey).toAccountHash();
  //**************************** for accounthash end*******************************/
  return {ownerHash, secondHash}
}