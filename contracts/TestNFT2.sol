// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT2 is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("TestNFT2", "TN2") {
        _safeMint(msg.sender, 1);
        _safeMint(msg.sender, 2);
    }

    function tokenURI(uint256 tokenId) public pure override returns (string memory) {
        require(tokenId == 1 || tokenId == 2, "Token does not exists");
        return TOKEN_URI;
    }
}