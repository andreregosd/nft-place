import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

const compareListing = (listing, collection, tokenId, price, seller, sold, cancelled) => {
    return listing.collection == collection 
            && listing.tokenId == tokenId 
            && listing.seller == seller 
            && listing.price.eq(price) // BigNumber
            && listing.sold == sold
            && listing.cancelled == cancelled;
}

describe("NFTPlace", function () {
  let deployer, user;
  let nftPlace;
  let nft1, nft2;
  let price = parseEther("0.1");
  let price2 = parseEther("0.3");
  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();
    let nftPlaceFactory = await ethers.getContractFactory("NFTPlace");
    nftPlace = await nftPlaceFactory.deploy();
    let nft1ContractFactory = await ethers.getContractFactory("TestNFT1");
    nft1 = await nft1ContractFactory.deploy();
    let nft2ContractFactory = await ethers.getContractFactory("TestNFT2");
    nft2 = await nft2ContractFactory.deploy();
  });

  describe("Listing", function () {
    it("Reverts if price is zero", async function () {
      await expect(nftPlace.listNFT(nft1.address, 1, 0)).to.be.revertedWith(
        "NFTPlace__InvalidPrice"
      );
    });
    it("Reverts if not the owner", async function () {
      await expect(nftPlace.connect(user).listNFT(nft1.address, 1, price)).to.be.revertedWith(
        "NFTPlace__NotOwner"
      );
    });
    it("Reverts if the NFT is already listed", async function () {
      // Approve
      let tx = await nft1.approve(nftPlace.address, 1);
      await tx.wait(1);
      // List 1
      let trx = await nftPlace.listNFT(nft1.address, 1, price);
      await trx.wait(1);

      await expect(nftPlace.listNFT(nft1.address, 1, price)).to.be.revertedWith(
        "NFTPlace__NFTAlreadyListed"
      );
    });
    it("Reverts if the NFT is not approved", async function () {
      await expect(nftPlace.listNFT(nft1.address, 1, price)).to.be.revertedWith(
        "NFTPlace__NFTNotApproved"
      );
    });
    it("Updates listings", async function () {
      // Approve
      let tokenId = 1;
      let tx = await nft1.approve(nftPlace.address, tokenId);
      await tx.wait(1);
      // List 1
      let trx = await nftPlace.listNFT(nft1.address, tokenId, price);
      await trx.wait(1);

      let listingCounter = await nftPlace.listingCounter();
      let firstListing = await nftPlace.listings(0);
      let firstActiveListing = await nftPlace.getActiveListing(nft1.address, 1);

      let isExpectedListing = compareListing(firstListing, nft1.address, tokenId, price, deployer.address, false, false);
      let isExpectedActiveListing = compareListing(firstActiveListing, nft1.address, tokenId, price, deployer.address, false, false);
      
      expect(listingCounter).to.equal(1);
      expect(isExpectedListing).to.equal(true);
      expect(isExpectedActiveListing).to.equal(true);
    });
  });

  describe("Cancel listing", function () {
    it("Reverts if NFT not listed", async function () {
      await expect(nftPlace.cancelListing(nft1.address, 1)).to.be.revertedWith(
        "NFTPlace__NFTNotListed"
      );
    });
    it("Reverts if not the owner", async function () {
        // Approve
        let tokenId = 1;
        let tx = await nft1.approve(nftPlace.address, tokenId);
        await tx.wait(1);
        // List 1
        let trx = await nftPlace.listNFT(nft1.address, tokenId, price);
        await trx.wait(1);

        await expect(nftPlace.connect(user).cancelListing(nft1.address, 1)).to.be.revertedWith(
            "NFTPlace__NotOwner"
        );
    });
    it("Updates listings", async function () {
      // Approve
      let tokenId = 1;
      let tx = await nft1.approve(nftPlace.address, tokenId);
      await tx.wait(1);
      // List 1
      let trx = await nftPlace.listNFT(nft1.address, tokenId, price);
      await trx.wait(1);

      let trx2 = await nftPlace.cancelListing(nft1.address, tokenId);
      await trx2.wait(1);

      let listingCounter = await nftPlace.listingCounter();
      let firstListing = await nftPlace.listings(0);
      let firstActiveListing = await nftPlace.getActiveListing(nft1.address, 1);
      
      expect(listingCounter).to.equal(1);
      expect(firstListing.cancelled).to.equal(true);
      expect(firstActiveListing.price).to.equal(0); // deleted
    });
  });

  describe("Update listing price", function () {
    beforeEach(async () => {
        // Approve
        let tx = await nft1.approve(nftPlace.address, 1);
        await tx.wait(1);
        // List 1
        let trx = await nftPlace.listNFT(nft1.address, 1, price);
        await trx.wait(1);
    });
    it("Reverts if given price is below zero", async function () {
      await expect(nftPlace.updateListingPrice(nft1.address, 1, 0)).to.be.revertedWith(
        "NFTPlace__InvalidPrice"
      );
    });
    it("Reverts if NFT is not listed", async function () {
        await expect(nftPlace.updateListingPrice(nft1.address, 2, price2)).to.be.revertedWith(
            "NFTPlace__NFTNotListed"
        );
    });
    it("Reverts if not owner", async function () {
        await expect(nftPlace.connect(user).updateListingPrice(nft1.address, 1, price2)).to.be.revertedWith(
            "NFTPlace__NotOwner"
        );
    });
    it("Updates listings", async function () {
      let trx = await nftPlace.updateListingPrice(nft1.address, 1, price2);
      await trx.wait(1);

      let firstActiveListing = await nftPlace.getActiveListing(nft1.address, 1);
      
      expect(firstActiveListing.price).to.equal(price2);
    });
  });

  describe("Buy NFT", function () {
    beforeEach(async () => {
        // Approve
        let tx = await nft1.approve(nftPlace.address, 1);
        await tx.wait(1);
        // List 1
        let trx = await nftPlace.listNFT(nft1.address, 1, price);
        await trx.wait(1);
    });
    it("Reverts if NFT is not listed", async function () {
        await expect(nftPlace.buyNFT(nft1.address, 2)).to.be.revertedWith(
            "NFTPlace__NFTNotListed"
        );
    });
    it("Reverts if not enought ETH sent", async function () {
        await expect(nftPlace.buyNFT(nft1.address, 1)).to.be.revertedWith(
            "NFTPlace__PriceNotMet"
        );
    });
    it("Updates listings", async function () {
      let trx = await nftPlace.buyNFT(nft1.address, 1, { value: price });
      await trx.wait(1);

      let listingCounter = await nftPlace.listingCounter();
      let firstListing = await nftPlace.listings(0);
      let firstActiveListing = await nftPlace.getActiveListing(nft1.address, 1);
      
      expect(listingCounter).to.equal(1);
      expect(firstListing.sold).to.equal(true);
      expect(firstActiveListing.price).to.equal(0); // deleted
    });
    it("Update balances mapping", async function () {
        let trx = await nftPlace.buyNFT(nft1.address, 1, { value: price });
        await trx.wait(1);
  
        let balance = await nftPlace.balanceOf(deployer.address);
        
        expect(balance).to.equal(price);
    });
    it("Updates the NFT owner", async function () {
        let trx = await nftPlace.connect(user).buyNFT(nft1.address, 1, { value: price });
        await trx.wait(1);
  
        let actualOwner = await nft1.ownerOf(1);
        
        expect(user.address).to.equal(actualOwner);
    });
  });

  describe("Withdraw funds", function () {
    beforeEach(async () => {
        // Approve
        let tx = await nft1.approve(nftPlace.address, 1);
        await tx.wait(1);
        // List 1
        let trx = await nftPlace.listNFT(nft1.address, 1, price);
        await trx.wait(1);
    });
    it("Reverts if there are no funds to withdraw", async function () {
        await expect(nftPlace.withdrawFunds()).to.be.revertedWith(
            "NFTPlace__NoFundsToWithdraw"
        );
    });
    it("Updates balances", async function () {
        // User buys from deployer
        let trx1 = await nftPlace.connect(user).buyNFT(nft1.address, 1, { value: price });
        await trx1.wait(1);

        let sellerInitialBalance = await ethers.provider.getBalance(deployer.address);
        let trx2 = await nftPlace.withdrawFunds();
        // Calculating gas cost
        let receipt = await trx2.wait();
        let gasUsed = receipt.gasUsed;
        let gasPrice = trx2.gasPrice;
        let gasCost = gasUsed * gasPrice;
        let expectedSellerFinalBalance = sellerInitialBalance.add(price).sub(gasCost);

        let sellerFinalBalance = await ethers.provider.getBalance(deployer.address);
        expect(sellerFinalBalance).to.equal(expectedSellerFinalBalance);
    });
  });

});