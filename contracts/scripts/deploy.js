// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

const { ethers, hardhatArguments } = require('hardhat');
const Config = require('./config');

async function main() {
  await Config.initConfig();
  const network = hardhatArguments.network ? hardhatArguments.network : 'dev';
  const [deployer] = await ethers.getSigners();
  console.log(`deploy from address: ${deployer.address}`);

  const Flappy = await ethers.getContractFactory('Flappy');
  const flappy = await Flappy.deploy();
  console.log(`Flappy address: ${flappy.address}`);
  Config.setConfig(`${network}.Flappy`, flappy.address);

  const Vault = await ethers.getContractFactory('Vault');
  const vault = await Vault.deploy();
  console.log(`Vault address: ${vault.address}`);
  Config.setConfig(`${network}.Vault`, vault.address);

  await Config.updateConfig();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
