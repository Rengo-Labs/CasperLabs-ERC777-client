import {
  CLValueBuilder,
  CLValueParsers,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";

import * as blake from "blakejs";
import { concat } from "@ethersproject/bytes";
import { CasperContractClient, constants, utils, helpers, types } from "casper-js-client-helper";
import {ERC20EntryPoints, ERC20Events, URefConstants} from "consts/constants";
const { DEFAULT_TTL } = constants;

const {
  installContract,
  setClient,
  contractSimpleGetter,
  createRecipientAddress
} = helpers;
// TODO: Refactor in both clients
type RecipientType = types.RecipientType;

class ERC20Client extends CasperContractClient {
  protected namedKeys?: {
    allowances: string;
    balances: string;
  };


  /**
   * Installs the ERC777 contract.
   *
   * @param keys AsymmetricKey that will be used to install the contract.
   * @param tokenName Name of the ERC20 token.
   * @param tokenSymbol Symbol of the ERC20 token.
   * @param granularity Specifies how many decimal places token will have.
   * @param tokenTotalSupply Specifies the amount of tokens in existance.
   * @param paymentAmount The payment amount that will be used to install the contract.
   * @param wasmPath Path to the WASM file that will be installed.
   *
   * @returns Installation deploy hash. 
   */
  public async install(
    keys: Keys.AsymmetricKey,
    tokenName: string,
    tokenSymbol: string,
    granularity: string,
    tokenTotalSupply: string,
    paymentAmount: string,
    wasmPath: string
  ) {
  const runtimeArgs = RuntimeArgs.fromMap({
    name: CLValueBuilder.string(tokenName),
    symbol: CLValueBuilder.string(tokenSymbol),
    granularity: CLValueBuilder.u256(granularity),
    total_supply: CLValueBuilder.u256(tokenTotalSupply)
  });

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
   * Set ERC777 contract hash, so it is possible to communicate with it.
   *
   * @param hash Contract hash (raw hex string as well as `hash-` prefixed format is supported).
   */
  public async setContractHash(hash: string) {
    const properHash = hash.startsWith("hash-") ? hash.slice(5) : hash;
    const { contractPackageHash, namedKeys } = await setClient(
      this.nodeAddress,
      properHash,
      [
        "balances",
        "allowances"
      ]
    );
    this.contractHash = hash;
    this.contractPackageHash = contractPackageHash;
    /* @ts-ignore */
    this.namedKeys = namedKeys;
  }

  /**
   * Returns the name of the ERC777 token.
   */
  public async name() {
    return await contractSimpleGetter(
        process.env.CHAIN_NAME,
        process.env.NODE_ADDRESS,
      [URefConstants.Name]
    );
  }

  /**
   * Returns the symbol of the ERC777 token.
   */
  public async symbol() {
    return await contractSimpleGetter(
        process.env.CHAIN_NAME,
        process.env.NODE_ADDRESS,
      [URefConstants.Symbol]
    );
  }

  /**
   * Returns the decimals of the ERC777 token.
   */
  public async decimals() {
    return await contractSimpleGetter(
        process.env.CHAIN_NAME,
        process.env.NODE_ADDRESS,
      [URefConstants.Decimals]
    );
  }

  /**
   * Returns the total supply of the ERC777 token.
   */
  public async totalSupply() {
    return await contractSimpleGetter(
        process.env.CHAIN_NAME,
        process.env.NODE_ADDRESS,
      [URefConstants.TotalSupply]
    );
  }

  /**
   * Transfers an amount of tokens from the direct caller to a recipient.
   *
   * @param keys AsymmetricKey that will be used to sign the transaction.
   * @param recipient Recipient address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param transferAmount Amount of tokens that will be transferred.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash.
   */
  public async transfer(
    keys: Keys.AsymmetricKey,
    recipient: RecipientType,
    transferAmount: string,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: createRecipientAddress(recipient),
      amount: CLValueBuilder.u256(transferAmount),
    });

    return await this.contractCall({
      entryPoint: ERC20EntryPoints.TransferEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Transfer, deployHash),
      ttl,
    });
  }

  /**
   * Transfers an amount of tokens from the owner to a recipient, if the direct caller has been previously approved to spend the specified amount on behalf of the owner.
   *
   * @param keys AsymmetricKey that will be used to sign the transaction.
   * @param owner Owner address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param recipient Recipient address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param transferAmount Amount of tokens that will be transfered.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash.
   */
  public async transferFrom(
    keys: Keys.AsymmetricKey,
    owner: RecipientType,
    recipient: RecipientType,
    transferAmount: string,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      recipient: createRecipientAddress(recipient),
      owner: createRecipientAddress(owner),
      amount: CLValueBuilder.u256(transferAmount),
    });

    return await this.contractCall({
      entryPoint: ERC20EntryPoints.TransferFromEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Transfer, deployHash),
      ttl,
    });
  }

  /**
   * Allows a spender to transfer up to an amount of the direct caller’s tokens.
   *
   * @param keys AsymmetricKey that will be used to sign the transaction.
   * @param spender Spender address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param approveAmount The amount of tokens that will be allowed to transfer.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash.
   */
  public async approve(
    keys: Keys.AsymmetricKey,
    spender: RecipientType,
    approveAmount: string,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      spender: createRecipientAddress(spender),
      amount: CLValueBuilder.u256(approveAmount),
    });

    return await this.contractCall({
      entryPoint: ERC20EntryPoints.ApproveEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Approve, deployHash),
      ttl,
    });
  }

  /**
   * Returns the balance of the account address.
   *
   * @param account Account address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   *
   * @returns Balance of an account.
   */
  public async balanceOf(account: RecipientType) {

    const key = createRecipientAddress(account);
    const keyBytes = CLValueParsers.toBytes(key).unwrap();
    const itemKey = Buffer.from(keyBytes).toString("base64");
    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      itemKey,
      this.namedKeys!.balances
    );
    return result.toString();
  }

  /**
   * Returns the amount of owner’s tokens allowed to be spent by spender.
   *
   * @param owner Owner address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param spender Spender address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   *
   * @returns Amount in tokens.
   */
  public async allowances(owner: RecipientType, spender: RecipientType) {
    const keyOwner = createRecipientAddress(owner);
    const keySpender = createRecipientAddress(spender);
    const finalBytes = concat([CLValueParsers.toBytes(keyOwner).unwrap(), CLValueParsers.toBytes(keySpender).unwrap()]);
    const blaked = blake.blake2b(finalBytes, undefined, 32);
    const encodedBytes = Buffer.from(blaked).toString("hex");

    const result = await utils.contractDictionaryGetter(
      this.nodeAddress,
      encodedBytes,
      this.namedKeys!.allowances
    );

    return result.toString();
  }
}

export default ERC20Client;
