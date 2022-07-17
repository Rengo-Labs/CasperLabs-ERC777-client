/**
 * @fileOverview CSPR JS SDK demo: ERC777 RECIPIENT - install contract.
 */

import {
  CasperClient, Contracts,
  DeployUtil,
} from "casper-js-sdk";
import * as constants from "../../consts/constants";
import * as utils from "../../helpers/utils";
import * as entryPoints from "../../consts/entryPoint";

/**
 * Demonstration of requests for ERC777Recipient.
 */
class ERC777Recipient {
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
            utils.getBinary(constants.PATH_TO_CONTRACT_ERC777_RECIPIENT),
            runtimeArgs
        ),
        DeployUtil.standardPayment(constants.DEPLOY_GAS_PAYMENT_FOR_ERC777_RECIPIENT_INSTALLATION)
    );

    deploy = this.client.signDeploy(deploy, this.keyPairOfContract);

    const deployHash = await this.client.putDeploy(deploy);

    utils.logDetails(constants.ERC777_RECIPIENT_CONTRACT, deployHash, constants.DEPLOY_GAS_PAYMENT_FOR_ERC777_RECIPIENT_INSTALLATION, constants.PATH_TO_CONTRACT_ERC777_RECIPIENT);
    return deployHash;
  }

  initContract = async (contractHash = null) => {
    const stateRootHash = await utils.getStateRootHash(this.client);

    if (contractHash == null) {
      contractHash = await utils.getAccountNamedKeyValue(
          this.client,
          stateRootHash,
          this.keyPairOfContract,
          constants.ERC777_RECIPIENT_CONTRACT
      );
    }

    const { Contract } = Contracts;
    this.contractClient = new Contract(this.client);
    this.contractClient.setContractHash(contractHash);
    this.contractHashAsByteArray = [
      ...Buffer.from(contractHash.slice(5), "hex"),
    ];
  }

  burn = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.BURN)

  transfer = async (runtimeArgs) => this.makeDeployment(runtimeArgs, entryPoints.TRANSFER)

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

    utils.logDetails(constants.ERC777_RECIPIENT_CONTRACT, deployHash, constants.DEPLOY_GAS_PAYMENT_FOR_TRANSACTION, constants.PATH_TO_CONTRACT_ERC777_RECIPIENT);
    return deployHash;
  }
}
export default ERC777Recipient