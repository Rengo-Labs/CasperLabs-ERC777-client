import {
  CasperClient,
  CLPublicKey,
  CLAccountHash,
  CLByteArray,
  CLKey,
  CLString,
  CLTypeBuilder,
  CLValue,
  CLValueBuilder,
  CLValueParsers,
  CLMap,
  DeployUtil,
  EventName,
  EventStream,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";
import { CasperContractClient, constants, utils, helpers, types } from "casper-js-client-helper";
import {ERC20Events, ERC777EntryPoints, ERC777SenderEntryPoints} from "consts/constants";
const { DEFAULT_TTL } = constants;
// TODO: Refactor in both clients
const {
  fromCLMap,
  toCLMap,
  installContract,
  setClient,
  contractSimpleGetter,
  contractCallFn,
  createRecipientAddress
} = helpers;
// TODO: Refactor in both clients
type RecipientType = types.RecipientType;

class Erc777SenderClient extends CasperContractClient {
  protected namedKeys?: {};


  /**
   * Installs the ERC20 contract.
   *
   * @param keys AsymmetricKey that will be used to install the contract.
   * @param erc1820_contract Name of the ERC20 token.
   * @param erc777_contract Symbol of the ERC20 token.
   * @param paymentAmount The payment amount that will be used to install the contract.
   * @param wasmPath Path to the WASM file that will be installed.
   *
   * @returns Installation deploy hash. 
   */
  public async install(
    keys: Keys.AsymmetricKey,
    erc1820_contract: RecipientType,
    erc777_contract: RecipientType,
    paymentAmount: string,
    wasmPath: string
  ) {
  const runtimeArgs = RuntimeArgs.fromMap({
    erc1820_contract: createRecipientAddress(erc1820_contract),
    erc777_contract: createRecipientAddress(erc777_contract)
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
      []
    );
    this.contractHash = hash;
    this.contractPackageHash = contractPackageHash;
    /* @ts-ignore */
    this.namedKeys = namedKeys;
  }

  /**
   * Transfers an amount of tokens from the owner to a recipient, if the direct caller has been previously approved to spend the specied amount on behalf of the owner.
   *
   * @param keys AsymmetricKey that will be used to sign the transaction.
   * @param owner Owner address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param recipient Recipient address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param amount Amount of tokens that will be transfered.
   * @param userData Amount of tokens that will be transfered.
   * @param operatorData Amount of tokens that will be transfered.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash. 
   */
  public async tokensToSend(
    keys: Keys.AsymmetricKey,
    owner: RecipientType,
    recipient: RecipientType,
    amount: string,
    userData: string,
    operatorData: string,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      owner: createRecipientAddress(owner),
      recipient: createRecipientAddress(recipient),
      amount: CLValueBuilder.u256(amount),
      user_data: CLValueBuilder.string(userData),
      operator_data: CLValueBuilder.string(operatorData)
    });

    return await this.contractCall({
      entryPoint: ERC777SenderEntryPoints.TokensToSendEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Transfer, deployHash),
      ttl,
    });
  }

  public async transfer(
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
      entryPoint: ERC777SenderEntryPoints.TransferEntryPoint,
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
   * @param account Spender address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param amount The amount of tokens that will be allowed to transfer.
   * @param data The amount of tokens that will be allowed to transfer.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash. 
   */
  public async burn(
    keys: Keys.AsymmetricKey,
    account: RecipientType,
    amount: string,
    data: string,
    paymentAmount: string,
    ttl = DEFAULT_TTL
  ) {
    const runtimeArgs = RuntimeArgs.fromMap({
      account: createRecipientAddress(account),
      amount: CLValueBuilder.u256(amount),
      data: CLValueBuilder.string(data),
    });

    return await this.contractCall({
      entryPoint: ERC777SenderEntryPoints.BurnEntryPoint,
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

}

export default Erc777SenderClient;
