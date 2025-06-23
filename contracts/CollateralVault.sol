// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CollateralVault
 * @author ABFX15
 * @notice Stores NFTs used as collateral for loans.
 */
contract CollateralVault is Ownable {
    error CollateralVault__NotLoanManager();
    error CollateralVault__AlreadyInVault();

    struct VaultItem {
        address originalOwner;
        uint256 loanId;
    }

    IERC721 public immutable i_nft;
    address public loanManager;

    mapping(uint256 => VaultItem) public vault;

    event NFTDeposited(
        uint256 indexed tokenId,
        uint256 indexed loanId,
        address indexed owner
    );
    event NFTReleased(uint256 indexed tokenId);
    event NFTLiquidated(uint256 indexed tokenId, address indexed to);
    event LoanManagerSet(address indexed newLoanManager);

    constructor(address nftAddress) Ownable(msg.sender) {
        i_nft = IERC721(nftAddress);
    }

    modifier onlyLoanManager() {
        if (msg.sender != loanManager) {
            revert CollateralVault__NotLoanManager();
        }
        _;
    }

    function setLoanManager(address _loanManager) external onlyOwner {
        loanManager = _loanManager;
        emit LoanManagerSet(_loanManager);
    }

    function depositNFT(
        uint256 tokenId,
        uint256 loanId,
        address owner
    ) external onlyLoanManager {
        if (vault[tokenId].originalOwner != address(0)) {
            revert CollateralVault__AlreadyInVault();
        }
        vault[tokenId] = VaultItem(owner, loanId);
        emit NFTDeposited(tokenId, loanId, owner);
    }

    function releaseNFT(uint256 tokenId) external onlyLoanManager {
        address owner = vault[tokenId].originalOwner;
        delete vault[tokenId];
        i_nft.transferFrom(address(this), owner, tokenId);
        emit NFTReleased(tokenId);
    }

    function liquidateAndTransfer(
        uint256 tokenId,
        address to
    ) external onlyLoanManager {
        delete vault[tokenId];
        i_nft.transferFrom(address(this), to, tokenId);
        emit NFTLiquidated(tokenId, to);
    }
}
