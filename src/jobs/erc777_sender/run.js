import {CLValueBuilder, RuntimeArgs} from "casper-js-sdk";
import {getAccounts} from "../../helpers/utils";
import ERC777 from "../../clients/erc777/ERC777";
import ERC777Sender from "../../clients/erc777_sender/ERC777Sender";

const run = async () => {

    const {ownerHash, operatorHash, recipientHash} = getAccounts();

    const erc777 = new ERC777()
    await erc777.initContract()

    await erc777.authorizeOperator(RuntimeArgs.fromMap({
        operator: CLValueBuilder.key(operatorHash)
    }))

    const erc777Sender = new ERC777Sender()
    await erc777Sender.initContract()

    await erc777Sender.transfer(RuntimeArgs.fromMap({
        from: CLValueBuilder.key(ownerHash),
        to: CLValueBuilder.key(recipientHash),
        amount: CLValueBuilder.u256(200),
        user_data: CLValueBuilder.list([]),
        operator_data: CLValueBuilder.list([])
    }))

    await erc777Sender.burn(RuntimeArgs.fromMap({
        account: CLValueBuilder.key(operatorHash),
        amount: CLValueBuilder.u256(100),
        user_data: CLValueBuilder.list([]),
        operator_data: CLValueBuilder.list([])
    }))
}

run()