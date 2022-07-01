export enum ERC20Events {
  Transfer = "transfer",
  Approve = "approve"
}

export enum URefConstants {
  Name = "name",
  Symbol = "symbol",
  Decimals = "decimals",
  TotalSupply = "total_supply",
  Granularity = "granularity",

}

export enum ERC1820EntryPoints {
  SetInterfaceImplementerEntryPoint = "set_interface_implementer",
  SetManagerEntryPoint = "set_manager"
}

export enum ERC20EntryPoints {
  TransferEntryPoint = "transfer",
  TransferFromEntryPoint = "transfer_from",
  ApproveEntryPoint = "approve"
}

export enum ERC777EntryPoints {
  GranularityEntryPoint = "granularity",
  SendEntryPoint = "send",
  OperatorSendEntryPoint = "operator_send",
  BurnEntryPoint = "burn",
  OperatorBurnEntryPoint = "operator_burn",
  DefaultOperatorsEntryPoint = "default_operators",
  AuthorizeOperatorEntryPoint = "authorize_operator",
  RevokeOperatorEntryPoint = "revoke_operator"
}

export enum ERC777RecipientEntryPoints {
  TokensReceivedEntryPoint = "tokens_received",
  TransferEntryPoint = "transfer",
  BurnEntryPoint = "burn",
}

export enum ERC777SenderEntryPoints {
  TokensToSendEntryPoint = "tokens_to_send",
  TransferEntryPoint = "transfer",
  BurnEntryPoint = "burn"
}

