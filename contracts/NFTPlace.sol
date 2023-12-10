// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error NFTPlace__NotOwner();
error NFTPlace__InvalidPrice();
error NFTPlace__NFTAlreadyListed();
error NFTPlace__NFTNotListed();
error NFTPlace__NFTNotApproved();
error NFTPlace__PriceNotMet();
error NFTPlace__NoFundsToWithdraw();
contract NFTPlace {

    struct Listing {
        uint256 id; // listing id
        address collection;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool sold;
        bool cancelled;
    }

    Listing[] public listings;
    uint256 public listingCounter;
    // mapping: collection => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) private activeListings;
    mapping(address => uint256) private balances;

    constructor() {
        listingCounter = 0;
    }

    function getActiveListing(address collection, uint256 tokenId) external view returns(Listing memory) {
        return activeListings[collection][tokenId];
    }

    function balanceOf(address seller) external view returns(uint256) {
        return balances[seller];
    }

    function listNFT(address collectionAddress, uint256 tokenId, uint256 price) external {
        if (price <= 0)
            revert NFTPlace__InvalidPrice();

        IERC721 collection = IERC721(collectionAddress);
        if(msg.sender != collection.ownerOf(tokenId))
            revert NFTPlace__NotOwner();

        if (activeListings[collectionAddress][tokenId].price > 0)
            revert NFTPlace__NFTAlreadyListed();
        
        if (collection.getApproved(tokenId) != address(this))
            revert NFTPlace__NFTNotApproved();
        
        Listing memory listing = Listing(++listingCounter, collectionAddress, tokenId, msg.sender, price, false, false);
        listings.push(listing);
        activeListings[collectionAddress][tokenId] = listing;
    }

    function cancelListing(address collectionAddress, uint256 tokenId) external {
        Listing memory listing = activeListings[collectionAddress][tokenId];
        if (listing.price <= 0)
            revert NFTPlace__NFTNotListed();

        if(msg.sender != listing.seller)
            revert NFTPlace__NotOwner();

        delete (activeListings[collectionAddress][tokenId]);
        listings[listing.id - 1].cancelled = true;
    }

    function updateListingPrice(address collectionAddress, uint256 tokenId, uint256 price) external {
        if (price <= 0)
            revert NFTPlace__InvalidPrice();

        Listing memory listing = activeListings[collectionAddress][tokenId];
        if (listing.price <= 0)
            revert NFTPlace__NFTNotListed();

        if(msg.sender != listing.seller)
            revert NFTPlace__NotOwner();

        activeListings[collectionAddress][tokenId].price = price;
        listings[listing.id - 1].price = price;
    }

    function buyNFT(address collectionAddress, uint256 tokenId) external payable {
        Listing memory listing = activeListings[collectionAddress][tokenId];
        if (listing.price <= 0)
            revert NFTPlace__NFTNotListed();

        if (msg.value < listing.price)
            revert NFTPlace__PriceNotMet();
        
        delete (activeListings[collectionAddress][tokenId]);
        listings[listing.id - 1].sold = true;

        IERC721(collectionAddress).safeTransferFrom(listing.seller, msg.sender, tokenId);
        balances[listing.seller] += msg.value;
    }

    function withdrawFunds() external {
        uint256 funds = balances[msg.sender]; // to save gas
        if(funds <= 0) 
            revert NFTPlace__NoFundsToWithdraw();

        balances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: funds}("");
        require(success, "Transfer failed");
    }
}
