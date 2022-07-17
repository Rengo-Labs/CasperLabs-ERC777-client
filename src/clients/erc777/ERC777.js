/**
 * @fileOverview CSPR JS SDK demo: ERC777.
 */
import {
  CasperClient, CLValueParsers, Contracts,
  DeployUtil
} from "casper-js-sdk";
import * as constants from "../../consts/constants";
import * as utils from "../../helpers/utils";
import * as entryPoints from "../../consts/entryPoint";
import * as blake from "blakejs";

/**
 * Demonstration of requests for ERC777.
 */
class ERC777 {
  constructor() {
    this.client = new CasperClient(constants.DEPLOY_NODE_ADDRESS);
    this.keyPairOfContract = utils.getKeyPairOfContract(
        constants.PATH_TO_SOURCE_KEYS
    );
  }

  install = async (runtimeArgs) => {
    console.log(`... Installing Contract`);

    let deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(
            this.keyPairOfContract.publicKey,
            constants.DEPLOY_CHAIN_NAME,
            constants.DEPLOY_GAS_PRICE,
            constants.DEPLOY_TTL_MS
        ),
        DeployUtil.ExecutableDeployItem.newModuleBytes(
            utils.getBinary(constants.PATH_TO_CONTRACT_ERC777),
            runtimeArgs
        ),
        DeployUtil.standardPayment(constants.DEPLOY_GAS_PAYMENT_FOR_ERC777_INSTALLATION)
    );

    deploy = this.client.signDeploy(deploy, this.keyPairOfContract);

    const deployHash = await this.client.putDeploy(deploy);

    utils.logDetails(constants.ERC777_CONTRACT, deployHash, constants.DEPLOY_GAS_PAYMENT_FOR_ERC777_INSTALLATION, constants.PATH_TO_CONTRACT_ERC777);
    return deployHash;
  }

  initContract = async (contractHash = null) => {
    const stateRootHash = await utils.getStateRootHash(this.client);

    if (contractHash == null) {
      contractHash = await utils.getAccountNamedKeyValue(
          this.client,
          stateRootHash,
          this.keyPairOfContract,
          constants.ERC777_CONTRACT
      );
    }

    const { Contract } = Contracts;
    this.contractClient = new Contract(this.client);
    this.contractClient.setContractHash(contractHash);
    this.contractHashAsByteArray = [
      ...Buffer.from(contractHash.slice(5), "hex"),
    ];
  }

  name = async () => {
    const result = await this.contractClient.queryContractData(["name"])
    return result.toString()
  }

  decimals = async () => {
    const result = await this.contractClient.queryContractData(["decimals"])
    return result.toString()
  }

  totalSupply = async () => {
    const result = await this.contractClient.queryContractData(["total_supply"])
    return result.toString();
  }

  balanceOf = async (owner) => {
    const finalBytes = CLValueParsers.toBytes(owner).unwrap();
    const itemKey = Buffer.from(finalBytes).toString("base64");
    const result = await this.contractClient.queryContractDictionary(
        "balances",
        itemKey
    ).catch(ex => {
      console.log("Does not exist balance for this account")
      return {data: "0"}
    })

    return result.data.toString();
  }

  send = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.SEND)

  burn = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.BURN)

  authorizeOperator = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.AUTHORIZE_OPERATOR)

  revokeOperator = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.REVOKE_OPERATOR)

  operatorSend = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.OPERATOR_SEND)

  operatorBurn = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.OPERATOR_BURN)

  granularity = async () => {
    const result = await this.contractClient.queryContractData(["granularity"])
    return result.toString()
  }

  getDefaultOperators = async (owner) => {
    const finalBytes = CLValueParsers.toBytes(owner).unwrap();
    const blaked = blake.blake2b(finalBytes, undefined, 32);
    const encodedBytes = Buffer.from(blaked).toString("hex");

    const result = await this.contractClient.queryContractDictionary("operators", encodedBytes)
        .catch(ex => {
          console.log("Does not exit operator for this account")
          return {data: ""}
        })

    return result.data.toString();
  }

  makeDeployment = async (runtimeArgs, entryPoint) => {
    let deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(
            this.keyPairOfContract.publicKey,
            constants.DEPLOY_CHAIN_NAME,
            constants.DEPLOY_GAS_PRICE,
            constants.DEPLOY_TTL_MS
        ),
        DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            this.contractHashAsByteArray,
            entryPoint,
            runtimeArgs
        ),
        DeployUtil.standardPayment(
            constants.DEPLOY_GAS_PAYMENT_FOR_TRANSACTION
        )
    );

    deploy = this.client.signDeploy(deploy, this.keyPairOfContract);

    const deployHash = await this.client.putDeploy(deploy);

    utils.logDetails(constants.ERC777_CONTRACT, deployHash, constants.DEPLOY_GAS_PAYMENT_FOR_TRANSACTION, constants.PATH_TO_CONTRACT_ERC777);
    return deployHash;
  }
}
export default ERC777