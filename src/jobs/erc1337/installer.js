import ERC1337 from '../../clients/erc1337/ERC1337';
import {CLAccountHash, CLByteArray, CLPublicKey, CLValueBuilder, RuntimeArgs} from "casper-js-sdk";

const installer = async () => {
    //**************************** for contracts end *******************************/
    //contract hash to replace with the correct erc1820 and erc777
    const erc20ContractArray = Uint8Array.from(Buffer.from("hash-590a29371bb8d7d57a319fbc984c09f12558a56129bdfa90e8b585011002eb77".slice(5), 'hex'));
    //**************************** for contracts end *******************************/
//6bc21d981ab85c81b765879b74c70832551e1c2b83f149f6e8ac7fc54a74df40
    const secondKey = "013b8bd1f2bfc7241d69e7cba488bfca52e29d2836e1a8e62035719aee0b81f5f1";

    const erc1337 = new ERC1337()
    await erc1337.install(RuntimeArgs.fromMap({
        to: CLValueBuilder.byteArray(CLPublicKey.fromHex(secondKey).toAccountHash()),
        token_amount: CLValueBuilder.u256(1000),
        period_seconds: CLValueBuilder.u64(100),
        erc20_contract_hash: CLValueBuilder.key(new CLByteArray(erc20ContractArray))
    }))
}

installer()