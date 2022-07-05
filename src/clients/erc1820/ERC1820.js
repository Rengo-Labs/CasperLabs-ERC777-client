/**
 * @fileOverview CSPR JS SDK demo: ERC1820 - install contract.
 */

import {
  CasperClient,
  CLValueParsers,
  Contracts,
  DeployUtil
} from "casper-js-sdk";
import * as constants from "../../consts/constants";
import * as utils from "../../helpers/utils";
import * as entryPoints from "../../consts/entryPoint";
import {concat} from "@ethersproject/bytes";
import * as blake from "blakejs";

/**
 * Demonstration of requests for ERC1820.
 */
class ERC1820 {
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
            utils.getBinary(constants.PATH_TO_CONTRACT_ERC1820),
            runtimeArgs
        ),
        DeployUtil.standardPayment(constants.DEPLOY_GAS_PAYMENT_FOR_ERC1820_INSTALLATION)
    );

    deploy = this.client.signDeploy(deploy, this.keyPairOfContract);

    const deployHash = await this.client.putDeploy(deploy);

    utils.logDetails(constants.ERC1820_CONTRACT, deployHash, constants.DEPLOY_GAS_PAYMENT_FOR_ERC1820_INSTALLATION, constants.PATH_TO_CONTRACT_ERC1820);
    return deployHash;
  }

  initContract = async (contractHash = null) => {
    const stateRootHash = await utils.getStateRootHash(this.client);

    if (contractHash == null) {
      contractHash = await utils.getAccountNamedKeyValue(
          this.client,
          stateRootHash,
          this.keyPairOfContract,
          constants.ERC1820_CONTRACT
      );
    }

    const { Contract } = Contracts;
    this.contractClient = new Contract(this.client);
    this.contractClient.setContractHash(contractHash);
    this.contractHashAsByteArray = [
      ...Buffer.from(contractHash.slice(5), "hex"),
    ];
  }

  setInterfaceImplementer = async (runtimeArgs) => this.makeDeployment(runtimeArgs)

  getInterfaceImplementer = async (owner, interfaceTag) => {
    const values = utils.stringToArrayCLU8(interfaceTag)
        .map(v => CLValueParsers.toBytes(v).unwrap());

    const finalBytes = concat([
      CLValueParsers.toBytes(owner).unwrap(),
      ...values
    ]);

    const blaked = blake.blake2b(finalBytes, undefined, 32);
    const encodedBytes = Buffer.from(blaked).toString("hex");

    const result = await this.contractClient.queryContractDictionary("implementers", encodedBytes);

    return `account-hash-${Buffer.from(result.value().data).toString("hex")}`;
  }

  setManager = async (runtimeArgs) => this.makeDeployment(runtimeArgs)

  getManager = async (owner) => {
    const finalBytes = CLValueParsers.toBytes(owner).unwrap();
    const blaked = blake.blake2b(finalBytes, undefined, 32);
    const encodedBytes = Buffer.from(blaked).toString("hex");

    const result = await this.contractClient.queryContractDictionary("managers", encodedBytes);

    return `account-hash-${Buffer.from(result.value().data).toString("hex")}`;
  }

  makeDeployment = async (runtimeArgs) => {
    let deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(
            this.keyPairOfContract.publicKey,
            constants.DEPLOY_CHAIN_NAME,
            constants.DEPLOY_GAS_PRICE,
            constants.DEPLOY_TTL_MS
        ),
        DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            this.contractHashAsByteArray,
            entryPoints.AUTHORIZE_OPERATOR,
            runtimeArgs
        ),
        DeployUtil.standardPayment(
            constants.DEPLOY_GAS_PAYMENT_FOR_TRANSACTION
        )
    );

    deploy = this.client.signDeploy(deploy, this.keyPairOfContract);

    const deployHash = await this.client.putDeploy(deploy);

    utils.logDetails(constants.ERC1820_CONTRACT, deployHash, constants.DEPLOY_GAS_PAYMENT_FOR_TRANSACTION, constants.PATH_TO_CONTRACT_ERC1820);
    return deployHash;
  }
}
export default ERC1820