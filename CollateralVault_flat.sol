

// Sources flattened with hardhat v2.24.3 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v5.0.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (utils/introspection/IERC165.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}


// File @openzeppelin/contracts/token/ERC721/IERC721.sol@v5.0.1

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/IERC721.sol)

pragma solidity ^0.8.20;

/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must have been allowed to move this token by either {approve} or
     *   {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon
     *   a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC721
     * or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
     * understand this adds an external call which potentially creates a reentrancy vulnerability.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 tokenId) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the address zero.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool approved) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) external view returns (address operator);

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}


// File contracts/DepositNftTypes.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.30;

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


// File contracts/CollateralVault.sol

// Original license: SPDX_License_Identifier: MIT

pragma solidity 0.8.30;


/// @title CollateralVault
/// @author ABFX15
/// @notice Manages NFT collateral and property values for loans
/// @dev Integrates with PropertyOracle for RWA price updates
contract CollateralVault {
    using DepositNftTypes for DepositNftTypes.DepositNft;

    error CollateralVault__NotAuthorized();
    error CollateralVault__InvalidOracle();

    IERC721 public immutable i_nft;
    address public oracle;

    /// @notice Mapping from tokenId to deposit struct
    mapping(uint256 => DepositNftTypes.DepositNft) public s_deposits;
    /// @notice Mapping from tokenId to appraised property value
    mapping(uint256 => uint256) public propertyValues;
    /// @notice Mapping from loanId to tokenId
    mapping(uint256 => uint256) public loanIdToTokenId;

    /// @notice Emitted when an NFT is deposited as collateral
    /// @param tokenId The NFT token ID
    /// @param loanId The associated loan ID
    /// @param value The appraised value at deposit
    /// @param timestamp The time of deposit
    /// @param borrower The address of the borrower
    event DepositNFT(
        uint256 tokenId,
        uint256 loanId,
        uint256 value,
        uint256 timestamp,
        address borrower
    );

    /// @notice Emitted when the appraised value of a property is updated
    /// @param tokenId The NFT token ID
    /// @param newValue The new appraised value
    event PropertyValueUpdated(uint256 tokenId, uint256 newValue);

    /// @notice Emitted when the oracle address is set
    /// @param oracle The address of the oracle contract
    event OracleSet(address oracle);

    /// @notice Initializes the CollateralVault contract
    /// @param nft The address of the NFT contract
    constructor(address nft) {
        i_nft = IERC721(nft);
    }

    /// @notice Restricts function to only the oracle address
    modifier onlyOracle() {
        if (msg.sender != oracle) revert CollateralVault__NotAuthorized();
        _;
    }

    /// @notice Sets the oracle address allowed to update property values
    /// @param _oracle The address of the oracle contract
    function setOracle(address _oracle) external /* onlyOwner */ {
        if (_oracle == address(0)) revert CollateralVault__InvalidOracle();
        oracle = _oracle;
        emit OracleSet(_oracle);
    }

    /// @notice Updates the appraised value of a property (NFT)
    /// @dev Only callable by the oracle
    /// @param tokenId The NFT token ID
    /// @param newValue The new appraised value
    function updatePropertyValue(
        uint256 tokenId,
        uint256 newValue
    ) external onlyOracle {
        propertyValues[tokenId] = newValue;
        emit PropertyValueUpdated(tokenId, newValue);
    }

    /// @notice Deposits an NFT as collateral and links it to a loan
    /// @param tokenId The NFT token ID
    /// @param loanId The associated loan ID
    function depositNFT(uint256 tokenId, uint256 loanId) external {
        uint256 value = _getCollateralValue(tokenId);
        s_deposits[tokenId] = DepositNftTypes.DepositNft({
            tokenId: tokenId,
            loanId: loanId,
            collateralValue: value,
            timestamp: block.timestamp,
            borrower: msg.sender,
            isActive: true
        });
        loanIdToTokenId[loanId] = tokenId;
        i_nft.transferFrom(msg.sender, address(this), tokenId);
        emit DepositNFT(tokenId, loanId, value, block.timestamp, msg.sender);
    }

    /// @notice Returns the deposit struct for a given tokenId
    /// @param tokenId The NFT token ID
    /// @return The DepositNft struct
    function getDepositNft(
        uint256 tokenId
    ) external view returns (DepositNftTypes.DepositNft memory) {
        return s_deposits[tokenId];
    }

    /// @notice Returns the appraised collateral value for a given tokenId
    /// @param tokenId The NFT token ID
    /// @return The appraised value
    function _getCollateralValue(
        uint256 tokenId
    ) internal view returns (uint256) {
        return propertyValues[tokenId];
    }

    /// @notice Returns the tokenId associated with a given loanId
    /// @param loanId The loan ID
    /// @return The NFT token ID
    function getTokenIdbyLoanId(
        uint256 loanId
    ) external view returns (uint256) {
        return loanIdToTokenId[loanId];
    }
}
