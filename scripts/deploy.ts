import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { network } from "hardhat";

async function main() {
  // Deploy NFT Place
  let nftPlaceFactory = await ethers.getContractFactory("NFTPlace");
  console.log("Deploying NFTPlace...")
  let nftPlace = await nftPlaceFactory.deploy();
  await nftPlace.deployed();
  console.log(`Deployed contract to: ${nftPlace.address}`);

  // This is for local development and should not be deployed to non local blockchains
  if(network.config.chainId == 31337){
    // Deploy NFT collection
    let testNFTFactory = await ethers.getContractFactory("TestNFT");
    console.log("Deploying test NFT...")
    let nft = await testNFTFactory.deploy();
    await nft.deployed();
    console.log(`Deployed contract to: ${nft.address}`);

    // List some nfts
    console.log("Listing NFTs...");
    for(let i = 0; i < 30; i++){
      await nft.approve(nftPlace.address, i);
      await nftPlace.listNFT(nft.address, i, parseEther("2"));
    }
    console.log("NFTs listed...");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
