// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title PropertyOracle
 * @author ABFX15
 * @notice Advanced oracle for storing and providing property valuations for NFTs.
 * @dev Supports multiple appraisers, price history, staleness checks, and validation.
 */
contract PropertyOracle is Ownable, AccessControl {
    
    // Custom Errors
    error PropertyOracle__InvalidValue();
    error PropertyOracle__InvalidTokenId();
    error PropertyOracle__PropertyNotExists();
    error PropertyOracle__StalePrice();
    error PropertyOracle__InvalidNFTContract();
    error PropertyOracle__InvalidTimeframe();
    error PropertyOracle__NoValueSet();
    error PropertyOracle__InvalidAppraiser();

    // Constants
    bytes32 public constant APPRAISER_ROLE = keccak256("APPRAISER_ROLE");
    uint256 public constant MIN_PROPERTY_VALUE = 1000; // Minimum $1000 in wei equivalent
    uint256 public constant MAX_PROPERTY_VALUE = 1000000000 ether; // Maximum $1B equivalent
    uint256 public constant DEFAULT_STALENESS_THRESHOLD = 30 days;

    // Structs
    struct PropertyValuation {
        uint256 value;
        uint256 timestamp;
        address appraiser;
        bool isActive;
    }

    struct PriceHistory {
        uint256 value;
        uint256 timestamp;
        address appraiser;
    }

    // State Variables
    IERC721 public immutable propertyNFT;
    uint256 public stalenessThreshold;
    
    mapping(uint256 => PropertyValuation) public propertyValues;
    mapping(uint256 => PriceHistory[]) public priceHistory;
    mapping(address => bool) public authorizedAppraisers;
    mapping(uint256 => uint256) public lastUpdateTime;

    // Events
    event PropertyValueUpdated(
        uint256 indexed tokenId, 
        uint256 newValue, 
        uint256 oldValue,
        address indexed appraiser,
        uint256 timestamp
    );
    event AppraiserAdded(address indexed appraiser);
    event AppraiserRemoved(address indexed appraiser);
    event StalenessThresholdUpdated(uint256 newThreshold);
    event PropertyDeactivated(uint256 indexed tokenId);
    event PropertyReactivated(uint256 indexed tokenId);

    modifier onlyAppraiser() {
        if (!hasRole(APPRAISER_ROLE, msg.sender)) {
            revert PropertyOracle__InvalidAppraiser();
        }
        _;
    }

    modifier validTokenId(uint256 tokenId) {
        if (tokenId == 0) revert PropertyOracle__InvalidTokenId();
        
        // Check if token exists in the NFT contract
        try propertyNFT.ownerOf(tokenId) returns (address) {
            // Token exists
        } catch {
            revert PropertyOracle__PropertyNotExists();
        }
        _;
    }

    constructor(address _propertyNFT) Ownable(msg.sender) {
        if (_propertyNFT == address(0)) revert PropertyOracle__InvalidNFTContract();
        
        propertyNFT = IERC721(_propertyNFT);
        stalenessThreshold = DEFAULT_STALENESS_THRESHOLD;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(APPRAISER_ROLE, msg.sender);
        
        authorizedAppraisers[msg.sender] = true;
    }

    /**
     * @notice Adds a new appraiser with permission to update property values.
     * @dev Only callable by contract owner.
     * @param appraiser The address to grant appraiser role.
     */
    function addAppraiser(address appraiser) external onlyOwner {
        if (appraiser == address(0)) revert PropertyOracle__InvalidAppraiser();
        
        _grantRole(APPRAISER_ROLE, appraiser);
        authorizedAppraisers[appraiser] = true;
        
        emit AppraiserAdded(appraiser);
    }

    /**
     * @notice Removes an appraiser's permission to update property values.
     * @dev Only callable by contract owner.
     * @param appraiser The address to revoke appraiser role.
     */
    function removeAppraiser(address appraiser) external onlyOwner {
        _revokeRole(APPRAISER_ROLE, appraiser);
        authorizedAppraisers[appraiser] = false;
        
        emit AppraiserRemoved(appraiser);
    }

    /**
     * @notice Sets the staleness threshold for property valuations.
     * @dev Only callable by contract owner.
     * @param newThreshold The new staleness threshold in seconds.
     */
    function setStalenessThreshold(uint256 newThreshold) external onlyOwner {
        if (newThreshold == 0 || newThreshold > 365 days) {
            revert PropertyOracle__InvalidTimeframe();
        }
        
        stalenessThreshold = newThreshold;
        emit StalenessThresholdUpdated(newThreshold);
    }

    /**
     * @notice Sets the value for a property NFT.
     * @dev Only callable by authorized appraisers. Validates value and token existence.
     * @param tokenId The NFT token ID.
     * @param value The property value to set.
     */
    function setPropertyValue(
        uint256 tokenId,
        uint256 value
    ) external onlyAppraiser validTokenId(tokenId) {
        if (value < MIN_PROPERTY_VALUE || value > MAX_PROPERTY_VALUE) {
            revert PropertyOracle__InvalidValue();
        }

        uint256 oldValue = propertyValues[tokenId].value;
        
        // Update current valuation
        propertyValues[tokenId] = PropertyValuation({
            value: value,
            timestamp: block.timestamp,
            appraiser: msg.sender,
            isActive: true
        });

        // Add to price history
        priceHistory[tokenId].push(PriceHistory({
            value: value,
            timestamp: block.timestamp,
            appraiser: msg.sender
        }));

        lastUpdateTime[tokenId] = block.timestamp;

        emit PropertyValueUpdated(tokenId, value, oldValue, msg.sender, block.timestamp);
    }

    /**
     * @notice Batch sets values for multiple properties.
     * @dev Only callable by authorized appraisers. More gas efficient for multiple updates.
     * @param tokenIds Array of NFT token IDs.
     * @param values Array of property values.
     */
    function batchSetPropertyValues(
        uint256[] calldata tokenIds,
        uint256[] calldata values
    ) external onlyAppraiser {
        if (tokenIds.length != values.length || tokenIds.length == 0) {
            revert PropertyOracle__InvalidTokenId();
        }

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            uint256 value = values[i];
            
            // Validate token exists
            if (tokenId == 0) revert PropertyOracle__InvalidTokenId();
            try propertyNFT.ownerOf(tokenId) returns (address) {
                // Token exists
            } catch {
                revert PropertyOracle__PropertyNotExists();
            }
            
            // Validate value
            if (value < MIN_PROPERTY_VALUE || value > MAX_PROPERTY_VALUE) {
                revert PropertyOracle__InvalidValue();
            }

            uint256 oldValue = propertyValues[tokenId].value;
            
            // Update valuation
            propertyValues[tokenId] = PropertyValuation({
                value: value,
                timestamp: block.timestamp,
                appraiser: msg.sender,
                isActive: true
            });

            // Add to history
            priceHistory[tokenId].push(PriceHistory({
                value: value,
                timestamp: block.timestamp,
                appraiser: msg.sender
            }));

            lastUpdateTime[tokenId] = block.timestamp;

            emit PropertyValueUpdated(tokenId, value, oldValue, msg.sender, block.timestamp);
        }
    }

    /**
     * @notice Deactivates a property valuation (e.g., if property is damaged/destroyed).
     * @dev Only callable by authorized appraisers.
     * @param tokenId The NFT token ID to deactivate.
     */
    function deactivateProperty(uint256 tokenId) external onlyAppraiser validTokenId(tokenId) {
        propertyValues[tokenId].isActive = false;
        emit PropertyDeactivated(tokenId);
    }

    /**
     * @notice Reactivates a property valuation.
     * @dev Only callable by authorized appraisers.
     * @param tokenId The NFT token ID to reactivate.
     */
    function reactivateProperty(uint256 tokenId) external onlyAppraiser validTokenId(tokenId) {
        if (propertyValues[tokenId].value == 0) revert PropertyOracle__NoValueSet();
        
        propertyValues[tokenId].isActive = true;
        emit PropertyReactivated(tokenId);
    }

    /**
     * @notice Gets the current property value with staleness check.
     * @dev Returns the property value if not stale, reverts otherwise.
     * @param tokenId The NFT token ID.
     * @return value The current property value.
     * @return timestamp The timestamp of the valuation.
     * @return appraiser The address of the appraiser who set the value.
     */
    function getPropertyValue(uint256 tokenId) external view validTokenId(tokenId) returns (
        uint256 value,
        uint256 timestamp,
        address appraiser
    ) {
        PropertyValuation memory valuation = propertyValues[tokenId];
        
        if (valuation.value == 0) revert PropertyOracle__NoValueSet();
        if (!valuation.isActive) revert PropertyOracle__PropertyNotExists();
        if (block.timestamp - valuation.timestamp > stalenessThreshold) {
            revert PropertyOracle__StalePrice();
        }

        return (valuation.value, valuation.timestamp, valuation.appraiser);
    }

    /**
     * @notice Gets property value without staleness check (for historical data).
     * @dev Always returns the last set value regardless of age.
     * @param tokenId The NFT token ID.
     * @return value The property value.
     * @return timestamp The timestamp of the valuation.
     * @return appraiser The address of the appraiser.
     * @return isActive Whether the property is active.
     * @return isStale Whether the price is stale.
     */
    function getPropertyValueUnchecked(uint256 tokenId) external view validTokenId(tokenId) returns (
        uint256 value,
        uint256 timestamp,
        address appraiser,
        bool isActive,
        bool isStale
    ) {
        PropertyValuation memory valuation = propertyValues[tokenId];
        
        bool stale = block.timestamp - valuation.timestamp > stalenessThreshold;
        
        return (
            valuation.value,
            valuation.timestamp,
            valuation.appraiser,
            valuation.isActive,
            stale
        );
    }

    /**
     * @notice Gets the price history for a property.
     * @dev Returns all historical valuations for the property.
     * @param tokenId The NFT token ID.
     * @return history Array of price history entries.
     */
    function getPriceHistory(uint256 tokenId) external view validTokenId(tokenId) returns (
        PriceHistory[] memory history
    ) {
        return priceHistory[tokenId];
    }

    /**
     * @notice Gets the latest N price entries for a property.
     * @dev Returns the most recent N valuations.
     * @param tokenId The NFT token ID.
     * @param count The number of recent entries to return.
     * @return history Array of recent price history entries.
     */
    function getRecentPriceHistory(uint256 tokenId, uint256 count) external view validTokenId(tokenId) returns (
        PriceHistory[] memory history
    ) {
        PriceHistory[] memory allHistory = priceHistory[tokenId];
        uint256 length = allHistory.length;
        
        if (count >= length) {
            return allHistory;
        }
        
        history = new PriceHistory[](count);
        for (uint256 i = 0; i < count; i++) {
            history[i] = allHistory[length - count + i];
        }
    }

    /**
     * @notice Checks if a property value is stale.
     * @param tokenId The NFT token ID.
     * @return isStale Whether the property value is stale.
     */
    function isPropertyValueStale(uint256 tokenId) external view returns (bool) {
        uint256 lastUpdate = lastUpdateTime[tokenId];
        return lastUpdate == 0 || (block.timestamp - lastUpdate > stalenessThreshold);
    }

    /**
     * @notice Gets the number of price history entries for a property.
     * @param tokenId The NFT token ID.
     * @return count The number of historical entries.
     */
    function getPriceHistoryCount(uint256 tokenId) external view returns (uint256) {
        return priceHistory[tokenId].length;
    }

    /**
     * @notice Checks if an address is an authorized appraiser.
     * @param appraiser The address to check.
     * @return isAuthorized Whether the address is an authorized appraiser.
     */
    function isAuthorizedAppraiser(address appraiser) external view returns (bool) {
        return hasRole(APPRAISER_ROLE, appraiser);
    }
}