import ERC777Recipient from '../../clients/erc777_recipient/ERC777Recipient';
import {CLByteArray, RuntimeArgs} from "casper-js-sdk";

const installer = async () => {

    //**************************** for contracts end *******************************/
    //contract hash to replace with the correct erc1820 and erc777
    const erc1820ContractArray = Uint8Array.from(Buffer.from("hash-124b3d14aeae1668afde1f35a28162c98d25446b52d19a1058e3cef7ac545bfe".slice(5), 'hex'));
    const erc777ContractArray = Uint8Array.from(Buffer.from("hash-590a29371bb8d7d57a319fbc984c09f12558a56129bdfa90e8b585011002eb77".slice(5), 'hex'));
    //**************************** for contracts end *******************************/

    const erc777Recipient = new ERC777Recipient()
    await erc777Recipient.install(RuntimeArgs.fromMap({
        erc1820_contract: new CLByteArray(erc1820ContractArray),
        erc777_contract: new CLByteArray(erc777ContractArray)
    }))
}

installer()