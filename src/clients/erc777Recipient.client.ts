import {
  CLAccountHash,
  CLValueBuilder,
  Keys,
  RuntimeArgs,
} from "casper-js-sdk";
import { CasperContractClient, constants, utils, helpers, types } from "casper-js-client-helper";
import {ERC20Events, ERC777EntryPoints, ERC777RecipientEntryPoints} from "consts/constants";
const { DEFAULT_TTL } = constants;

const {
  installContract,
  setClient,
  createRecipientAddress
} = helpers;

type RecipientType = types.RecipientType;

class ERC777RecipientClient extends CasperContractClient {
  protected namedKeys?: {};


  /**
   * Installs the ERC777 Recipient contract.
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
      erc1820_contract: CLAccountHash,
      erc777_contract: CLAccountHash,
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
   * Set ERC777 Recipient contract hash so its possible to communicate with it.
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
   * Received an amount of tokens from the implementer of  to a recipient, if the direct caller has been previously
   * approved to spend the specied amount on behalf of the owner.
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
  public async tokensReceived(
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
      user_dta: CLValueBuilder.string(userData),
      operator_data: CLValueBuilder.string(operatorData)
    });

    return await this.contractCall({
      entryPoint: ERC777RecipientEntryPoints.TokensReceivedEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Transfer, deployHash),
      ttl,
    });
  }

  /**
   * Transfers an amount of tokens from the owner to a recipient, if the direct caller has been previously
   * assigned as an account's operator on behalf of the owner.
   *
   * @param keys AsymmetricKey that will be used to sign the transaction.
   * @param owner Owner address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param recipient Recipient address (it supports CLPublicKey, CLAccountHash and CLByteArray).
   * @param amount Amount of tokens that will be transferred.
   * @param userData User data to be sent to contract receptor.
   * @param operatorData Operator data to be sent to contract receptor.
   * @param paymentAmount Amount that will be used to pay the transaction.
   * @param ttl Time to live in miliseconds after which transaction will be expired (defaults to 30m).
   *
   * @returns Deploy hash.
   */
  public async transfer(
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
      entryPoint: ERC777RecipientEntryPoints.TransferEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Transfer, deployHash),
      ttl,
    });
  }

  public async burn(
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
      operator_data: CLValueBuilder.u256(operatorData),
    });

    return await this.contractCall({
      entryPoint: ERC777RecipientEntryPoints.BurnEntryPoint,
      keys,
      paymentAmount,
      runtimeArgs,
      cb: deployHash => this.addPendingDeploy(ERC20Events.Approve, deployHash),
      ttl,
    });
  }
}

export default ERC777RecipientClient;
