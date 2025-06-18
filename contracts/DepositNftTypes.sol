// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

/**
 * @title DepositNftTypes
 * @author ABFX15
 * @notice Library defining data structures for NFT collateral deposits
 * @dev Used by CollateralVault to track deposit information
 */
library DepositNftTypes {
    /**
     * @notice Structure representing an NFT deposit used as collateral
     * @param tokenId The NFT token ID
     * @param loanId Associated loan ID
     * @param collateralValue USD value of the NFT at deposit time
     * @param timestamp When the deposit was made
     * @param borrower Address of the borrower who deposited
     * @param isActive Whether the deposit is currently active
     */
    struct DepositNft {
        uint256 tokenId;
        uint256 loanId;
        uint256 collateralValue;
        uint256 timestamp;
        address borrower;
        bool isActive;
    }
    
    /**
     * @notice Validates that a deposit structure has required fields
     * @param deposit The deposit to validate
     * @return isValid True if deposit is valid
     */
    function isValidDeposit(DepositNft memory deposit) internal pure returns (bool isValid) {
        return deposit.tokenId > 0 && 
               deposit.loanId > 0 && 
               deposit.collateralValue > 0 && 
               deposit.borrower != address(0) &&
               deposit.isActive;
    }
    
    /**
     * @notice Creates a new deposit structure
     * @param tokenId NFT token ID
     * @param loanId Loan ID
     * @param collateralValue Value in USD
     * @param borrower Borrower address
     * @return deposit New deposit structure
     */
    function createDeposit(
        uint256 tokenId,
        uint256 loanId,
        uint256 collateralValue,
        address borrower
    ) internal view returns (DepositNft memory deposit) {
        return DepositNft({
            tokenId: tokenId,
            loanId: loanId,
            collateralValue: collateralValue,
            timestamp: block.timestamp,
            borrower: borrower,
            isActive: true
        });
    }
}