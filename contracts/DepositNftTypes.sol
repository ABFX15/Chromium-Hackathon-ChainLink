// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

library DepositNftTypes {
    struct DepositNft {
        uint256 tokenId;
        uint256 loanId;
        uint256 collateralValue;
        uint256 timestamp;
        address borrower;
        bool isActive;
    }
}
