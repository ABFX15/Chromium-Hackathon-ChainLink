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
    uint256 private _nextTokenId = 1;
    mapping(uint256 => string) private _tokenURIs;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        if (bytes(baseURI).length == 0) revert InvalidBaseURI();
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Mints a new property NFT to the specified address.
     * @dev Only callable by the contract owner. Sets the token URI.
     * @param to The recipient address.
     * @param uri The metadata URI for the property.
     * @return tokenId The minted token ID.
     */
    function safeMint(
        address to,
        string memory uri
    ) external onlyOwner returns (uint256) {
        if (to == address(0)) revert InvalidRecipient();
        if (bytes(uri).length == 0) revert InvalidTokenURI();

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /**
     * @notice Sets the base URI for all tokens.
     * @dev Only callable by the contract owner.
     * @param baseURI The new base URI.
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        if (bytes(baseURI).length == 0) revert InvalidBaseURI();
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Returns the token URI for a given tokenId.
     * @dev Returns custom URI if set, otherwise base URI + tokenId.
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
     * @dev Only callable by owner or approved address.
     * @param tokenId The token ID to burn.
     */
    function burn(uint256 tokenId) public override {
        if (!_isApprovedOrOwner(_msgSender(), tokenId)) {
            revert NotOwnerOrApproved();
        }
        _burn(tokenId);
    }

    /**
     * @notice Internal function to set the token URI for a token.
     * @dev Only callable internally. Reverts if token does not exist or URI is empty.
     * @param tokenId The token ID.
     * @param _tokenURI The token URI to set.
     */
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        if (!_exists(tokenId)) revert NonexistentToken();
        if (bytes(_tokenURI).length == 0) revert InvalidTokenURI();
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @notice Checks if the contract supports a given interface.
     * @param interfaceId The interface ID to check.
     * @return True if supported, false otherwise.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Internal override for increasing balance.
     * @param account The account to increase balance for.
     * @param value The value to increase.
     */
    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    /**
     * @notice Internal override for updating token ownership.
     * @param to The new owner address.
     * @param tokenId The token ID.
     * @param auth The authorized address.
     * @return The previous owner address.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Internal view helper to check if a token exists.
     * @param tokenId The token ID to check.
     * @return True if token exists, false otherwise.
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @notice Internal view helper to check if a spender is approved or owner.
     * @param spender The address to check.
     * @param tokenId The token ID to check.
     * @return True if spender is approved or owner, false otherwise.
     */
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
