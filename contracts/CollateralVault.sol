// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CollateralVault
 * @author ABFX15
 * @notice Stores NFTs used as collateral for loans.
 * @dev Only the LoanManager can deposit, release, or liquidate NFTs.
 */
contract CollateralVault is Ownable {
    error CollateralVault__NotLoanManager();
    error CollateralVault__AlreadyInVault();
    error CollateralVault__NotOwner();
    error CollateralVault__AddressZero();

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
    event DebugTokenIdCheck(uint256 tokenId);

    constructor(
        address nftAddress,
        address initialOwner
    ) Ownable(initialOwner) {
        i_nft = IERC721(nftAddress);
    }

    modifier onlyLoanManager() {
        if (msg.sender != loanManager) {
            revert CollateralVault__NotLoanManager();
        }
        _;
    }

    /**
     * @notice Sets the loan manager contract address.
     * @dev Only callable by the owner. Reverts if address is zero.
     * @param _loanManager The address of the loan manager contract.
     */
    function setLoanManager(address _loanManager) external onlyOwner {
        if (_loanManager == address(0)) {
            revert CollateralVault__AddressZero();
        }
        loanManager = _loanManager;
        emit LoanManagerSet(_loanManager);
    }

    /**
     * @notice Deposits an NFT as collateral for a loan.
     * @dev Only callable by the loan manager. Records the original owner and loan ID.
     * @param tokenId The NFT token ID to deposit.
     * @param loanId The associated loan ID.
     * @param owner The address of the original NFT owner.
     */
    function depositNFT(
        uint256 tokenId,
        uint256 loanId,
        address owner
    ) external onlyLoanManager {
        if (owner == address(0)) {
            revert CollateralVault__AddressZero();
        }
        if (vault[tokenId].originalOwner != address(0)) {
            revert CollateralVault__AlreadyInVault();
        }
        vault[tokenId] = VaultItem(owner, loanId);

        if (i_nft.ownerOf(tokenId) != address(this)) {
            revert CollateralVault__NotOwner();
        }
        i_nft.transferFrom(owner, address(this), tokenId);
        emit NFTDeposited(tokenId, loanId, owner);
    }

    /**
     * @notice Releases an NFT back to its original owner after loan repayment or cancellation.
     * @dev Only callable by the loan manager.
     * @param tokenId The NFT token ID to release.
     */
    function releaseNFT(uint256 tokenId) external onlyLoanManager {
        address owner = vault[tokenId].originalOwner;
        delete vault[tokenId];
        i_nft.transferFrom(address(this), owner, tokenId);
        emit NFTReleased(tokenId);
    }

    /**
     * @notice Liquidates an NFT and transfers it to a specified address (typically the lender).
     * @dev Only callable by the loan manager.
     * @param tokenId The NFT token ID to liquidate.
     * @param to The address to transfer the NFT to.
     */
    function liquidateAndTransfer(
        uint256 tokenId,
        address to
    ) external onlyLoanManager {
        delete vault[tokenId];
        i_nft.transferFrom(address(this), to, tokenId);
        emit NFTLiquidated(tokenId, to);
    }
}
