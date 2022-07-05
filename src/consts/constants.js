export const PATH_TO_SOURCE_KEYS = `./ed25519-keys`;

export const PATH_TO_CONTRACT_ERC1820 =
    process.env.PATH_TO_CONTRACT_ERC1820 ||
    `./wasm/erc1820_registry.wasm`;

export const PATH_TO_CONTRACT_ERC777 =
    process.env.PATH_TO_CONTRACT_ERC777 ||
    `./wasm/erc777_token.wasm`;

export const PATH_TO_CONTRACT_ERC777_SENDER =
    process.env.PATH_TO_CONTRACT_ERC777_SENDER ||
    `./wasm/erc777_sender.wasm`;

export const PATH_TO_CONTRACT_ERC777_RECIPIENT =
    process.env.PATH_TO_CONTRACT_ERC777_RECIPIENT ||
    `./wasm/erc777_recipient.wasm`;

// Name of target chain.
export const DEPLOY_CHAIN_NAME =
  process.env.DEPLOY_CHAIN_NAME || "casper-test";

// Gas payment to be offered.
export const DEPLOY_GAS_PAYMENT_FOR_ERC1820_INSTALLATION =
  process.env.DEPLOY_GAS_PAYMENT_FOR_ERC1820_INSTALLATION || 55000000000;

export const DEPLOY_GAS_PAYMENT_FOR_ERC777_INSTALLATION =
    process.env.DEPLOY_GAS_PAYMENT_FOR_ERC777_INSTALLATION || 110000000000;

export const DEPLOY_GAS_PAYMENT_FOR_ERC777_RECIPIENT_INSTALLATION =
    process.env.DEPLOY_GAS_PAYMENT_FOR_ERC777_RECIPIENT_INSTALLATION || 55000000000;

export const DEPLOY_GAS_PAYMENT_FOR_ERC777_SENDER_INSTALLATION =
    process.env.DEPLOY_GAS_PAYMENT_FOR_ERC777_SENDER_INSTALLATION || 55000000000;

// Gas payment for native transfers to be offered.
export const DEPLOY_GAS_PAYMENT_FOR_TRANSACTION =
  process.env.DEPLOY_GAS_PAYMENT_FOR_TRANSACTION || 1000000000;

// Gas price to be offered.
export const DEPLOY_GAS_PRICE = process.env.DEPLOY_GAS_PRICE
  ? parseInt(process.env.DEPLOY_GAS_PRICE)
  : 1;

// Address of target node.
export const DEPLOY_NODE_ADDRESS =
  process.env.DEPLOY_NODE_ADDRESS || "http://16.162.124.124:7777/rpc";

// Time interval in milliseconds after which deploy will not be processed by a node.
export const DEPLOY_TTL_MS = process.env.DEPLOY_TTL_MS
    ? parseInt(process.env.DEPLOY_TTL_MS)
    : 1800000;

export const ERC1820_CONTRACT = process.env.ERC1820_CONTRACT || "erc1820_registry";
export const ERC777_CONTRACT = process.env.ERC777_CONTRACT || "erc777_token_contract";
export const ERC777_SENDER_CONTRACT = process.env.ERC777_SENDER_CONTRACT || "erc777_sender";
export const ERC777_RECIPIENT_CONTRACT = process.env.ERC777_RECIPIENT_CONTRACT || "erc777_recipient";