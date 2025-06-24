// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    event MintCalled(address indexed to, uint256 indexed tokenId);
    event TransferFromCalled(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}

    function mint(address to, uint256 tokenId) public {
        emit MintCalled(to, tokenId);
        _mint(to, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        emit TransferFromCalled(from, to, tokenId);
        super.transferFrom(from, to, tokenId);
    }
}
