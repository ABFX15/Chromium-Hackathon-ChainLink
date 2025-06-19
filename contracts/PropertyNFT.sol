// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title PropertyNFT
 * @author ABFX15
 * @notice ERC721 NFT representing real-world property, with enumeration, burnability, and owner-only minting.
 * @dev Used as collateral in the lending protocol. Supports custom token URIs and integrates with CollateralVault and LoanManager.
 */
contract PropertyNFT is ERC721, ERC721Enumerable, ERC721Burnable, Ownable {
    using Strings for uint256;

    error NotOwnerOrApproved();
    error InvalidTokenURI();
    error NonexistentToken();
    error InvalidBaseURI();
    error InvalidRecipient();

    string private _baseTokenURI;
    mapping(uint256 => string) private _tokenURIs;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        if (bytes(baseURI).length == 0) revert InvalidBaseURI();
        _baseTokenURI = baseURI;
    }

    // ========== Public Functions ==========
    /**
     * @notice Mints a new property NFT to the specified address.
     * @param to The recipient address.
     * @param tokenId The unique token ID.
     * @param uri The metadata URI for the property.
     */
    function safeMint(
        address to,
        uint256 tokenId,
        string memory uri
    ) external onlyOwner {
        if (to == address(0)) revert InvalidRecipient();
        if (bytes(uri).length == 0) revert InvalidTokenURI();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @notice Sets the base URI for all tokens.
     * @param baseURI The new base URI.
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        if (bytes(baseURI).length == 0) revert InvalidBaseURI();
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Returns the token URI for a given tokenId.
     * @param tokenId The token ID.
     * @return The token URI string.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (!_exists(tokenId)) revert NonexistentToken();

        string memory _tokenURI = _tokenURIs[tokenId];
        if (bytes(_tokenURI).length > 0) {
            return _tokenURI;
        }
        return string(abi.encode(_baseTokenURI, tokenId.toString()));
    }

    /**
     * @notice Burns a token if called by owner or approved.
     * @param tokenId The token ID to burn.
     */
    function burn(uint256 tokenId) public override {
        if (!_isApprovedOrOwner(_msgSender(), tokenId)) {
            revert NotOwnerOrApproved();
        }
        _burn(tokenId);
    }

    // ========== Internal Functions ==========
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        if (!_exists(tokenId)) revert NonexistentToken();
        if (bytes(_tokenURI).length == 0) revert InvalidTokenURI();
        _tokenURIs[tokenId] = _tokenURI;
    }

    // ========== Overrides ==========
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    // ========== Internal View Helpers ==========
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view returns (bool) {
        address owner = _ownerOf(tokenId);
        return (spender == owner ||
            isApprovedForAll(owner, spender) ||
            getApproved(tokenId) == spender);
    }
}
