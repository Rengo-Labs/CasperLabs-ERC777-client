import ERC1820 from '../../clients/erc1820/ERC1820';
import {CLValueBuilder, RuntimeArgs} from "casper-js-sdk";
import {getAccounts} from "../../helpers/utils";

const run = async () => {

    const {ownerHash, operatorHash, recipientHash} = getAccounts();

    const erc1820 = new ERC1820()
    await erc1820.initContract()

    await erc1820.setManager(RuntimeArgs.fromMap({
        account: CLValueBuilder.key(ownerHash),
        new_manager: CLValueBuilder.key(ownerHash)
    }))

    const manager = await erc1820.getManager(CLValueBuilder.key(ownerHash));
    console.log("Manager: ", manager)

    await erc1820.setInterfaceImplementer(RuntimeArgs.fromMap({
        account: CLValueBuilder.key(ownerHash),
        i_hash: CLValueBuilder.list(utils.stringToArrayCLU8("ERC777TokensSender")),
        implementer: CLValueBuilder.key(operatorHash),
    }))

    const implementer = await erc1820.getInterfaceImplementer(CLValueBuilder.key(ownerHash), "ERC777TokensSender")
    console.log("Implementer: ", implementer)
}

run()