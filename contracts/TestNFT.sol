// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT is ERC721 {
    uint256 private counter;

    constructor() ERC721("TestNFT", "TN") {
        counter = 0;
        for(uint256 i = 0; i < 32; i++){
            _safeMint(msg.sender, counter++);
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < counter, "Token does not exists");
        uint256 moddedTokenId = tokenId % 16;
        if(moddedTokenId == 0)
            return "ipfs://QmexaUSpvZzS2cXonjDwQtoo5yToMu97fdGL6Jp4Szgwvh";
        else if(moddedTokenId == 1)
            return "ipfs://QmcdDvrFdJKFr8jGKGvgvZdTFgSY7K2B1K1pev3aTEhv9i";
        else if(moddedTokenId == 2)
            return "ipfs://QmfJ9d5UmTWTPdCSfhKqLPSrZ38jGrHZbXck5PMAoqgp28";
        else if(moddedTokenId == 3)
            return "ipfs://QmW4NLJReF1TyxF6sr7G8v11j5MbBTJPPaX3WFn4e5cMim";
        else if(moddedTokenId == 4)
            return "ipfs://QmU1vCYHjKgLqRSGNPRMvkki75EBtXxidt2MHMwudxeNeX";
        else if(moddedTokenId == 5)
            return "ipfs://QmfTHATm153J2jbxmLFeEibtktfUvC27NTNLryugRzeBtL";
        else if(moddedTokenId == 6)
            return "ipfs://Qmb4oPnAH5D4br5UqFdQnD8Tu4QAZ5CBSMbkApkiTqzwHQ";
        else if(moddedTokenId == 7)
            return "ipfs://QmcxbBQExNM8Mjvn3iWgZxeKjDo8NJuBK5j5nUUqsdqQ78";
        else if(moddedTokenId == 8)
            return "ipfs://QmNu7jgPjyBSCY2cRqTjqHHELbNPEht2FzFuoFKyBQrTKa";
        else if(moddedTokenId == 9)
            return "ipfs://QmPHL6KNKijZ3gxZV9fFXwvDScvdq7tEuHThU44t2ye1BB";
        else if(moddedTokenId == 10)
            return "ipfs://QmNyxg5bpQBKzJCJu82cZRFvBuJfa4LiDfNh4Fc85eF2z1";
        else if(moddedTokenId == 11)
            return "ipfs://QmedsPpFLSex9kcRmWABGR12WKg1iSvbsMRussxho6DXre";
        else if(moddedTokenId == 12)
            return "ipfs://QmbFg14W2qJG4ExAjPS44osXjRbFnm9gbNoMYX4woMb1Yj";
        else if(moddedTokenId == 13)
            return "ipfs://QmbhwQYeLozdvvh3L3DontCEx8AGMA5A7pEhoAn7mAYozi";
        else if(moddedTokenId == 14)
            return "ipfs://QmbmRHwRQLDZoF5wpMM5zYJQCZxJgqtvi3xxoWP8Lpba72";
        else
            return "ipfs://QmXjaphenmjYMedNeQJgKbgA6oGqrh4jyAu6gQP8ai88Wq";
    }
}