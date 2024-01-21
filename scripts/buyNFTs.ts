import { ethers } from "hardhat";
import { formatEther } from "ethers/lib/utils";

const impersonateAddress = async (address) => {
    const hre = require('hardhat');
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [address],
    });
    const signer = await ethers.getSigner(address);
    return signer;
  };

async function main() {
  const [deployer] = await ethers.getSigners();
  let owner = "0x4D0C91D588B1e4D17F3F25a5F8fc39886BA6CD68";
  let nftAddress = "0xeeca64ea9fcf99a22806cd99b3d29cf6e8d54925";
  let tokenId = 1841;

  let signer = await impersonateAddress(owner);
  let balance = await ethers.provider.getBalance(owner);
  console.log(formatEther(balance));

  let nftContract = await ethers.getContractAt("ERC721", nftAddress, signer);
  //let b = await nftContract.balanceOf(owner);
  let trx = await nftContract.transferFrom(owner, deployer.address, tokenId)
  trx.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});