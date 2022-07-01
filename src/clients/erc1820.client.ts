import {
  CasperClient,
  CLPublicKey,
  CLAccountHash,
  CLValueBuilder,
  CLValueParsers,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";
import { CasperContractClient, constants, utils, helpers, types } from "casper-js-client-helper";
import { ERC1820EntryPoints, ERC20Events } from "consts/constants";
import {concat} from "@ethersproject/bytes";
import * as blake from "blakejs";
const { DEFAULT_TTL } = constants;
const {
  installContract,
  setClient,
  createRecipientAddress
} = helpers;
// TODO: Refactor in both clients
type RecipientType = types.RecipientType;

class Erc1820Client extends CasperContractClient {
  protected namedKeys?: {
    implementers: string;
    managers: string;
  };


  /**
   * Installs the ERC1820 contract.
   *
   * @param keys AsymmetricKey that will be used to install the contract.
   * @param paymentAmount The payment amount that will be used to install the contract.
   * @param wasmPath Path to the WASM file that will be installed.
   *
   * @returns Installation deploy hash. 
   */
  public async install(
    keys: Keys.AsymmetricKey,
    paymentAmount: string,
    wasmPath: string
  ) {
  const runtimeArgs = RuntimeArgs.fromMap({});

    return await installContract(
        process.env.CHAIN_NAME,
        process.env.NODE_ADDRESS,
      keys,
      runtimeArgs,
      paymentAmount,
      wasmPath
    );
  }

  /**
   * Set ERC1820 contract hash so its possible to communicate with it.
   *
   * @param hash Contract hash (raw hex string as well as `hash-` prefixed format is supported).
   */
  public async setContractHash(hash: string) {
    const properHash = hash.startsWith("hash-") ? hash.slice(5) : hash;
    const { contractPackageHash, namedKeys } = await setClient(
      this.nodeAddress,
      properHash,
      [
        "implementers",
        "managers"
      ]
    );
    this.contractHash = hash;
    this.contractPackageHash = contractPackageHash;
    /* @ts-ignore */
    this.namedKeys = namedKeys;
  }

  /**
   * Allows a spender to transfer up to an amount of the direct caller’s tokens.
   *
   * @param keys AsymmetricKey that will be used to sign the transaction.
   * @param account Account address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param iHash The amount of tokens that will be allowed to transfer.
   * @param implementer The amount of tokens that will be allowed to transfer.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash. 
   */
  public async setInterfaceImplementer(
    keys: Keys.AsymmetricKey,
    account: RecipientType,
    iHash: string,
    implementer: RecipientType,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      account: CLValueBuilder.key(account),
      i_hash: CLValueBuilder.string(iHash),
      implementer: CLValueBuilder.key(implementer),
    });

    return await this.contractCall({
      entryPoint: ERC1820EntryPoints.SetInterfaceImplementerEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Approve, deployHash),
      ttl,
    });
  }

  /**
   * Allows a spender to transfer up to an amount of the direct caller’s tokens.
   *
   * @param keys AsymmetricKey that will be used to sign the transaction.
   * @param account Account address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param newManager The amount of tokens that will be allowed to transfer.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash.
   */
  public async setManager(
      keys: Keys.AsymmetricKey,
      account: RecipientType,
      newManager: RecipientType,
      paymentAmount: string,
      ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      account: CLValueBuilder.key(account),
      new_manager: CLValueBuilder.key(newManager),
    });

    return await this.contractCall({
      entryPoint: ERC1820EntryPoints.SetManagerEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Approve, deployHash),
      ttl,
    });
  }

  /**
   * Returns the implementer of the account address.
   *
   * @param account Account address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param iHash Tag to classify the type of implementer is.
   *
   * @returns Balance of an account.
   */
  public async getInterfaceImplementer(account: RecipientType, iHash: string) {
    const keyAccount = createRecipientAddress(account);
    const keyIHash = CLValueBuilder.string(iHash);
    const finalBytes = concat([CLValueParsers.toBytes(keyAccount).unwrap(), CLValueParsers.toBytes(keyIHash).unwrap()]);
    const blaked = blake.blake2b(finalBytes, undefined, 32);
    const encodedBytes = Buffer.from(blaked).toString("hex");

    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      encodedBytes,
      this.namedKeys!.implementers
    );
    return result.toString();
  }

  /**
   * Returns the manager of the account address.
   *
   * @param account Account address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   *
   * @returns Balance of an account.
   */
  public async getManager(account: RecipientType) {
    const keyAccount = createRecipientAddress(account);
    const finalBytes = CLValueParsers.toBytes(keyAccount).unwrap();
    const blaked = blake.blake2b(finalBytes, undefined, 32);
    const encodedBytes = Buffer.from(blaked).toString("hex");

    const result = await utils.contractDictionaryGetter(
        this.nodeAddress,
        encodedBytes,
        this.namedKeys!.managers
    );
    return result.toString();
  }

}

export default Erc1820Client;
