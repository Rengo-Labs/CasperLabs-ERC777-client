import {
  CLValueBuilder,
  CLValueParsers,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";

import { CasperContractClient, constants, utils, helpers, types } from "casper-js-client-helper";
import {ERC20Events, ERC777EntryPoints, URefConstants} from "consts/constants";
const { DEFAULT_TTL } = constants;

const {
  installContract,
  setClient,
  contractSimpleGetter,
  createRecipientAddress
} = helpers;

type RecipientType = types.RecipientType;

class ERC777Client extends CasperContractClient {
  protected namedKeys?: {
    allowances: string;
    balances: string;
    operators: string;
    erc1820_global_registry: string;
  };


  /**
   * Installs the ERC777 contract.
   *
   * @param keys AsymmetricKey that will be used to install the contract.
   * @param tokenName Name of the ERC20 token.
   * @param tokenSymbol Symbol of the ERC20 token.
   * @param granularity Specifies how many times it may divide itself.
   * @param tokenTotalSupply Specifies the amount of tokens in existence.
   * @param erc1820Contract Specifies the erc1820 contract hash .
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
    erc1820Contract: RecipientType,
    paymentAmount: string,
    wasmPath: string
  ) {
  const runtimeArgs = RuntimeArgs.fromMap({
    name: CLValueBuilder.string(tokenName),
    symbol: CLValueBuilder.string(tokenSymbol),
    granularity: CLValueBuilder.u256(granularity),
    total_supply: CLValueBuilder.u256(tokenTotalSupply),
    erc1820_contract: CLValueBuilder.key(erc1820Contract)
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
   * Set ERC20 contract hash so its possible to communicate with it.
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
          "allowances",
          "operators",
          "erc1820_global_registry"
      ]
    );
    this.contractHash = hash;
    this.contractPackageHash = contractPackageHash;
    /* @ts-ignore */
    this.namedKeys = namedKeys;
  }

  /**
   * Returns the name of the ERC20 token. 
   */
  public async name() {
    return await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash!,
      [URefConstants.Name]
    );
  }

  /**
   * Returns the symbol of the ERC20 token. 
   */
  public async symbol() {
    return await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash!,
      [URefConstants.Symbol]
    );
  }

  /**
   * Returns the decimals of the ERC20 token. 
   */
  public async decimals() {
    return await contractSimpleGetter(
      this.nodeAddress,
      this.contractHash!,
      [URefConstants.Decimals]
    );
  }

  /**
   * Returns the total supply of the ERC20 token. 
   */
  public async totalSupply() {
    return await contractSimpleGetter(
        process.env.CHAIN_NAME,
        process.env.NODE_ADDRESS,
      [URefConstants.TotalSupply]
    );
  }

  /**
   * Returns the total supply of the ERC20 token.
   */
  public async granularity() {
    return await contractSimpleGetter(
        process.env.CHAIN_NAME,
        process.env.NODE_ADDRESS,
        [URefConstants.Granularity]
    );
  }

  /**
   * Transfers an amount of tokens from the owner to a recipient, if the direct caller has been previously approved to spend the specied amount on behalf of the owner.
   *
   * @param keys AsymmetricKey that will be used to sign the transaction.
   * @param owner Owner address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param recipient Recipient address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param transferAmount Amount of tokens that will be transfered.
   * @param data Amount of tokens that will be transfered.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash. 
   */
  public async send(
    keys: Keys.AsymmetricKey,
    owner: RecipientType,
    recipient: RecipientType,
    transferAmount: string,
    data: string,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      owner: createRecipientAddress(owner),
      amount: CLValueBuilder.u256(transferAmount),
      data: CLValueBuilder.string(data)
    });

    return await this.contractCall({
      entryPoint: ERC777EntryPoints.SendEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Transfer, deployHash),
      ttl,
    });
  }

  public async operatorSend(
      keys: Keys.AsymmetricKey,
      owner: RecipientType,
      recipient: RecipientType,
      transferAmount: string,
      data: string,
      operatorData: string,
      paymentAmount: string,
      ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      owner: createRecipientAddress(owner),
      recipient: createRecipientAddress(recipient),
      amount: CLValueBuilder.u256(transferAmount),
      data: CLValueBuilder.string(data),
      operatorData: CLValueBuilder.string(operatorData)
    });

    return await this.contractCall({
      entryPoint: ERC777EntryPoints.OperatorSendEntryPoint,
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
   * @param amount Spender address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param data The amount of tokens that will be allowed to transfer.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash. 
   */
  public async burn(
    keys: Keys.AsymmetricKey,
    amount: string,
    data: string,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      amount: CLValueBuilder.u256(amount),
      data: CLValueBuilder.string(data),
    });

    return await this.contractCall({
      entryPoint: ERC777EntryPoints.BurnEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Approve, deployHash),
      ttl,
    });
  }

  public async operatorBurn(
      keys: Keys.AsymmetricKey,
      owner: RecipientType,
      amount: string,
      data: string,
      operatorData: string,
      paymentAmount: string,
      ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      account: createRecipientAddress(owner),
      amount: CLValueBuilder.u256(amount),
      data: CLValueBuilder.u256(data),
      operatorData: CLValueBuilder.u256(operatorData),
    });

    return await this.contractCall({
      entryPoint: ERC777EntryPoints.OperatorBurnEntryPoint,
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

}

export default ERC777Client;
