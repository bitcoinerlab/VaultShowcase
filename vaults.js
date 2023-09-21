const FEE = 500;
import { Psbt, address, networks } from "bitcoinjs-lib";
import * as secp256k1 from "@bitcoinerlab/secp256k1";
import * as descriptors from "@bitcoinerlab/descriptors";
const { Descriptor, ECPair } = descriptors.DescriptorsFactory(secp256k1);
import { EsploraExplorer } from "@bitcoinerlab/explorer";
import { DiscoveryFactory } from "@bitcoinerlab/discovery";

import { compilePolicy } from "@bitcoinerlab/miniscript";
import { encode as olderEncode } from "bip68";
import { signBIP32, signECPair } from "@bitcoinerlab/descriptors/dist/signers";

export function createVault({
  nextInternalAddress,
  panicAddr,
  lockBlocks,
  masterNode,
  network,
  utxos,
  balance,
  discovery,
}) {
  const vaultPair = ECPair.makeRandom();
  const vaultDescriptor = new Descriptor({
    expression: `wpkh(${vaultPair.publicKey.toString("hex")})`,
    network,
  });

  const psbtVault = new Psbt({ network });
  const vaultInputDescriptors = [];
  utxos.forEach((utxo) => {
    const { expression, index, vout, txHex } = discovery.getScriptPubKeysByUtxo(
      { utxo, network },
    )[0];
    const descriptor = new Descriptor({ expression, index, network });
    const inputIndex = descriptor.updatePsbt({ psbt: psbtVault, txHex, vout });
    vaultInputDescriptors[inputIndex] = descriptor;
  });
  const vaultBalance = balance - FEE;
  const vaultAddress = vaultDescriptor.getAddress();
  psbtVault.addOutput({ address: vaultAddress, value: vaultBalance });
  signBIP32({ psbt: psbtVault, masterNode });

  descriptors.finalizePsbt({
    psbt: psbtVault,
    descriptors: vaultInputDescriptors,
  });
  const vaultTxHex = psbtVault.extractTransaction().toHex();

  const older = olderEncode({ blocks: lockBlocks });
  const POLICY = (older) =>
    `or(pk(@panicKey),99@and(pk(@unvaultKey),older(${older})))`;
  const { miniscript, issane } = compilePolicy(POLICY(older));
  if (!issane) throw new Error("Policy not sane");

  const panicPair = ECPair.makeRandom();
  const panicKey = panicPair.publicKey;
  const unvaultPair = ECPair.makeRandom();
  const unvaultKey = unvaultPair.publicKey;

  const triggerExpression = `wsh(${miniscript
    .replace("@unvaultKey", unvaultKey.toString("hex"))
    .replace("@panicKey", panicKey.toString("hex"))})`;

  //Create the trigger output descriptor instance spendable by Panic
  const triggerDescriptorPanicPath = new Descriptor({
    expression: triggerExpression,
    network,
    signersPubKeys: [panicKey],
  });
  const triggerAddress = triggerDescriptorPanicPath.getAddress();
  const psbtTrigger = new Psbt({ network });
  vaultDescriptor.updatePsbt({ psbt: psbtTrigger, vout: 0, txHex: vaultTxHex });
  const triggerBalance = balance - 2 * FEE;
  psbtTrigger.addOutput({ address: triggerAddress, value: triggerBalance });
  signECPair({ psbt: psbtTrigger, ecpair: vaultPair });
  vaultDescriptor.finalizePsbtInput({ index: 0, psbt: psbtTrigger });
  const triggerTxHex = psbtTrigger.extractTransaction().toHex();

  const psbtPanic = new Psbt({ network });
  triggerDescriptorPanicPath.updatePsbt({
    psbt: psbtPanic,
    txHex: triggerTxHex,
    vout: 0,
  });
  psbtPanic.addOutput({ address: panicAddr, value: balance - 3 * FEE });
  signECPair({ psbt: psbtPanic, ecpair: panicPair });
  triggerDescriptorPanicPath.finalizePsbtInput({ index: 0, psbt: psbtPanic });
  const panicTxHex = psbtPanic.extractTransaction().toHex();

  //Create the trigger output descriptor instance spendable by Unvault. Consolidates
  //a utxo into an internal address compatible with BIP39+BIP84 wallets
  const triggerDescriptorUnvaultPath = new Descriptor({
    expression: triggerExpression,
    network,
    signersPubKeys: [unvaultKey],
  });
  const psbtUnvault = new Psbt({ network });
  triggerDescriptorUnvaultPath.updatePsbt({
    psbt: psbtUnvault,
    txHex: triggerTxHex,
    vout: 0,
  });
  psbtUnvault.addOutput({
    address: nextInternalAddress,
    value: balance - 3 * FEE,
  });
  signECPair({ psbt: psbtUnvault, ecpair: unvaultPair });
  triggerDescriptorUnvaultPath.finalizePsbtInput({
    index: 0,
    psbt: psbtUnvault,
  });
  const unvaultTxHex = psbtUnvault.extractTransaction().toHex();

  return {
    vaultAddress,
    triggerAddress,
    vaultTxHex,
    vaultBalance,
    triggerBalance,
    triggerTxHex,
    unvaultTxHex,
    panicTxHex,
    panicAddr,
    lockBlocks,
    remainingBlocks: lockBlocks,
  };
}

export function esploraUrl(network) {
  const url =
    network === networks.testnet
      ? "https://blockstream.info/testnet/api/"
      : network === networks.bitcoin
      ? "https://blockstream.info/api/"
      : null;
  if (!url)
    throw new Error(`Error: Esplora API not available for this network`);
  return url;
}

export async function remainingBlocks(vault, network) {
  const url = esploraUrl(network);
  const explorer = new EsploraExplorer({ url });
  const { Discovery } = DiscoveryFactory(explorer);
  await explorer.connect();
  const discovery = new Discovery();
  const expressions = `addr(${vault.triggerAddress})`;
  await discovery.discover({ expressions, network, gapLimit: 3 });
  const history = discovery.getHistory({ expressions, network });
  const triggerBlockHeight = (history.length && history[0].blockHeight) || 0;
  const blockHeight = await explorer.fetchBlockHeight();
  await explorer.close();
  if (!blockHeight || !triggerBlockHeight) return vault.lockBlocks;
  else return vault.lockBlocks - (blockHeight - triggerBlockHeight) - 1; //-1 for the next mined block
}

export function validateAddress(addressValue, network) {
  try {
    address.toOutputScript(addressValue, network);
    return true;
  } catch (e) {
    return false;
  }
}
