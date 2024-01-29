// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT is ERC721 {
    constructor() ERC721("TestNFT", "TN") {
        uint256 counter = 0;
        for(uint256 i = 0; i < 32; i++){
            _safeMint(msg.sender, counter++);
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < counter, "Token does not exists");
        return "ipfs://QmXjaphenmjYMedNeQJgKbgA6oGqrh4jyAu6gQP8ai88Wq";
    }
}