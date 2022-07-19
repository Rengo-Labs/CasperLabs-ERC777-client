/**
 * @fileOverview CSPR JS SDK demo: ERC1337 - install contract.
 */

import {
  CasperClient, Contracts,
  DeployUtil,
} from "casper-js-sdk";
import * as constants from "../../consts/constants";
import * as utils from "../../helpers/utils";
import * as entryPoints from "../../consts/entryPoint";

/**
 * Demonstration of requests for ERC1337.
 */
class ERC1337 {
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
            utils.getBinary(constants.PATH_TO_CONTRACT_ERC1337),
            runtimeArgs
        ),
        DeployUtil.standardPayment(constants.DEPLOY_GAS_PAYMENT_FOR_ERC1337_INSTALLATION)
    );

    deploy = this.client.signDeploy(deploy, this.keyPairOfContract);

    const deployHash = await this.client.putDeploy(deploy);

    utils.logDetails(constants.ERC1337_CONTRACT, deployHash, constants.DEPLOY_GAS_PAYMENT_FOR_ERC1337_INSTALLATION, constants.PATH_TO_CONTRACT_ERC1337);
    return deployHash;
  }

  initContract = async (contractHash) => {
    const stateRootHash = await utils.getStateRootHash(this.client);

    if (contractHash == null) {
      contractHash = await utils.getAccountNamedKeyValue(
          this.client,
          stateRootHash,
          this.keyPairOfContract,
          constants.ERC1337_CONTRACT
      );
    }

    const { Contract } = Contracts;
    this.contractClient = new Contract(this.client);
    this.contractClient.setContractHash(contractHash);
    this.contractHashAsByteArray = [
        ...Buffer.from(contractHash.slice(5), "hex")
    ];
  }

  cancelSubscription = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.CANCEL_SUBSCRIPTION)

  createSubscriptionHash = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.CREATE_SUBSCRIPTION_HASH)

  executeSubscription = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.EXECUTE_SUBSCRIPTION)

  getSubscriptionHash = async (accountHashString) => {
    const result = await this.contractClient.queryContractDictionary(
        "hashes",
        accountHashString
    ).catch(ex => {
      console.log("Does not exist account hash for this contract")
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

    utils.logDetails(constants.ERC1337_CONTRACT, deployHash, constants.DEPLOY_GAS_PAYMENT_FOR_TRANSACTION, constants.PATH_TO_CONTRACT_ERC1337);
    return deployHash;
  }
}
export default ERC1337