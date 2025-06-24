// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title LenderNFT
 * @author ABFX15
 * @notice NFT representing lender positions in loans
 * @dev Minted when lender funds a loan, burned when loan is repaid/liquidated
 */
contract LenderNFT is ERC721, Ownable {
    using Strings for uint256;
    // Custom Errors
    error LenderNFT__NotAuthorized();
    error LenderNFT__TokenNotExists();
    error LenderNFT__InvalidLoanManager();

    // State variables
    address public loanManager;
    uint256 public nextTokenId = 1;

    // Mappings
    mapping(uint256 => uint256) public tokenIdToLoan; // NFT ID -> Loan ID
    mapping(uint256 => uint256) public loanIdToToken; // Loan ID -> NFT ID
    mapping(uint256 => uint256) public lenderPositions; // NFT ID -> Amount lent

    // Events
    event LenderPositionMinted(
        uint256 indexed tokenId,
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount
    );
    event LenderPositionBurned(uint256 indexed tokenId, uint256 indexed loanId);

    // Modifiers
    modifier onlyLoanManager() {
        if (msg.sender != loanManager) revert LenderNFT__NotAuthorized();
        _;
    }

    constructor()
        ERC721("RWA Lender Position", "RWALEND")
        Ownable(msg.sender)
    {}

    /**
     * @notice Sets the loan manager address (owner only)
     * @param _loanManager Loan manager contract address
     */
    function setLoanManager(address _loanManager) external onlyOwner {
        if (_loanManager == address(0)) revert LenderNFT__InvalidLoanManager();
        loanManager = _loanManager;
    }

    /**
     * @notice Mints NFT representing lender position (loan manager only)
     * @param lender Address of the lender
     * @param loanId Associated loan ID
     * @param amount Amount lent
     * @return tokenId The minted NFT token ID
     */
    function mintLenderPosition(
        address lender,
        uint256 loanId,
        uint256 amount
    ) external onlyLoanManager returns (uint256) {
        uint256 tokenId = nextTokenId++;

        _mint(lender, tokenId);

        tokenIdToLoan[tokenId] = loanId;
        loanIdToToken[loanId] = tokenId;
        lenderPositions[tokenId] = amount;

        emit LenderPositionMinted(tokenId, loanId, lender, amount);
        return tokenId;
    }

    /**
     * @notice Burns lender NFT when loan is repaid/liquidated (loan manager only)
     * @param tokenId NFT token ID to burn
     */
    function burnLenderPosition(uint256 tokenId) external onlyLoanManager {
        if (!_exists(tokenId)) revert LenderNFT__TokenNotExists();

        uint256 loanId = tokenIdToLoan[tokenId];

        delete tokenIdToLoan[tokenId];
        delete loanIdToToken[loanId];
        delete lenderPositions[tokenId];

        _burn(tokenId);

        emit LenderPositionBurned(tokenId, loanId);
    }

    /**
     * @notice Get lender position details
     * @param tokenId NFT token ID
     * @return loanId Associated loan ID
     * @return amount Amount lent
     */
    function getLenderPosition(
        uint256 tokenId
    ) external view returns (uint256 loanId, uint256 amount) {
        if (!_exists(tokenId)) revert LenderNFT__TokenNotExists();
        return (tokenIdToLoan[tokenId], lenderPositions[tokenId]);
    }

    /**
     * @notice Override tokenURI to provide metadata
     * @param tokenId NFT token ID
     * @return Token URI string
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (!_exists(tokenId)) revert LenderNFT__TokenNotExists();

        // In production, this would return proper metadata JSON
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    "eyJuYW1lIjoiUldBIExlbmRlciBQb3NpdGlvbiAj",
                    tokenId.toString(),
                    "IiwiZGVzY3JpcHRpb24iOiJSZXByZXNlbnRzIGEgbGVuZGVyIHBvc2l0aW9uIGluIGFuIFJXQSBsb2FuIn0="
                )
            );
    }

    /**
     * @notice Check if token exists
     * @param tokenId Token ID to check
     * @return exists True if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
