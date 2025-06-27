// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

/**
 * @title AIRiskManager
 * @author ABFX15
 * @notice Enhanced AI-based risk assessment for loans using Chainlink Functions with fallback mechanisms
 * @dev Requests and stores risk scores, volatility, and recommended interest rates for loans with robust error handling
 */
contract AIRiskManager is FunctionsClient, Ownable, ReentrancyGuard, Pausable {
    using FunctionsRequest for FunctionsRequest.Request;

    // Enhanced Custom Errors
    error AIRiskManager__InvalidLoanId();
    error AIRiskManager__InvalidRiskScore();
    error AIRiskManager__InvalidInterestRate();
    error AIRiskManager__NotAuthorized();
    error AIRiskManager__InvalidSubscriptionId();
    error AIRiskManager__AIResponseParseFailed();
    error AIRiskManager__RequestAlreadyPending();
    error AIRiskManager__RateLimitExceeded();
    error AIRiskManager__InvalidDataFormat();
    error AIRiskManager__FallbackModeActive();

    // Enhanced State Variables
    uint64 public subscriptionId;
    address public loanManager;
    bool public fallbackMode;
    uint256 public requestCount;
    uint256 public maxRequestsPerHour;
    uint256 public lastRequestTimestamp;

    // Risk scoring parameters
    uint256 public constant MIN_RISK_SCORE = 0;
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant BASE_INTEREST_RATE = 500; // 5% base rate
    uint256 public constant MAX_INTEREST_RATE = 2000; // 20% max rate
    uint256 public constant DEFAULT_RISK_SCORE = 50;
    uint256 public constant DEFAULT_VOLATILITY_SCORE = 50;
    uint256 public constant DEFAULT_INTEREST_RATE = 1000; // 10%
    uint256 public constant CHAINLINK_GAS_LIMIT = 300000; // Increased for better reliability
    uint256 public constant REQUEST_TIMEOUT = 5 minutes;
    uint256 public constant HOUR_IN_SECONDS = 3600;

    // Enhanced Structs
    struct RiskAssessment {
        uint256 riskScore;
        uint256 volatilityScore;
        uint256 interestRate;
        uint256 timestamp;
        bool isValid;
    }

    struct PendingRequest {
        uint256 loanId;
        uint256 timestamp;
        bool isActive;
    }

    // Enhanced Mappings
    mapping(uint256 => RiskAssessment) public loanRiskAssessments;
    mapping(bytes32 => PendingRequest) public pendingRequests;
    mapping(uint256 => bool) public loanRequestPending;
    mapping(uint256 => uint256) public hourlyRequestCount; // timestamp => count

    // Events
    event RiskScoreUpdated(
        uint256 indexed loanId,
        uint256 riskScore,
        uint256 interestRate,
        uint256 volatilityScore,
        uint256 timestamp
    );
    event AIRiskRequested(
        bytes32 indexed requestId,
        uint256 indexed loanId,
        uint256 timestamp
    );
    event FallbackModeToggled(bool enabled, uint256 timestamp);
    event RequestFailed(
        bytes32 indexed requestId,
        uint256 indexed loanId,
        string reason
    );
    event RateLimitUpdated(uint256 newLimit);

    constructor(
        address router,
        uint256 _maxRequestsPerHour
    ) FunctionsClient(router) Ownable(msg.sender) {
        maxRequestsPerHour = _maxRequestsPerHour;
    }

    modifier onlyLoanManager() {
        if (msg.sender != loanManager) revert AIRiskManager__NotAuthorized();
        _;
    }

    modifier rateLimited() {
        uint256 currentHour = block.timestamp / HOUR_IN_SECONDS;
        if (hourlyRequestCount[currentHour] >= maxRequestsPerHour) {
            revert AIRiskManager__RateLimitExceeded();
        }
        _;
        hourlyRequestCount[currentHour]++;
    }

    modifier validLoanId(uint256 loanId) {
        if (loanId == 0) revert AIRiskManager__InvalidLoanId();
        _;
    }

    /**
     * @notice Sets the Chainlink Functions subscription ID with enhanced validation
     */
    function setSubscriptionId(uint64 _subscriptionId) external onlyOwner {
        if (_subscriptionId == 0) revert AIRiskManager__InvalidSubscriptionId();
        subscriptionId = _subscriptionId;
    }

    /**
     * @notice Sets the loan manager contract address with validation
     */
    function setLoanManager(address _loanManager) external onlyOwner {
        if (_loanManager == address(0)) revert AIRiskManager__NotAuthorized();
        loanManager = _loanManager;
    }

    /**
     * @notice Toggle fallback mode for emergency situations
     */
    function toggleFallbackMode() external onlyOwner {
        fallbackMode = !fallbackMode;
        emit FallbackModeToggled(fallbackMode, block.timestamp);
    }

    /**
     * @notice Update rate limiting parameters
     */
    function setMaxRequestsPerHour(uint256 _maxRequests) external onlyOwner {
        maxRequestsPerHour = _maxRequests;
        emit RateLimitUpdated(_maxRequests);
    }

    /**
     * @notice Pause contract in emergency
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Enhanced risk assessment request with better error handling and validation
     */
    function requestRiskAssessment(
        uint256 loanId,
        string calldata borrowerData,
        string calldata collateralData,
        string calldata marketData
    )
        external
        nonReentrant
        onlyLoanManager
        whenNotPaused
        rateLimited
        validLoanId(loanId)
        returns (bytes32)
    {
        if (fallbackMode) {
            _setFallbackRiskAssessment(loanId);
            revert AIRiskManager__FallbackModeActive();
        }

        if (loanRequestPending[loanId]) {
            revert AIRiskManager__RequestAlreadyPending();
        }

        // Validate input data format
        if (
            bytes(borrowerData).length == 0 ||
            bytes(collateralData).length == 0 ||
            bytes(marketData).length == 0
        ) {
            revert AIRiskManager__InvalidDataFormat();
        }

        loanRequestPending[loanId] = true;
        requestCount++;
        // Enhanced JavaScript source with better error handling
        string memory source = _buildEnhancedJavaScriptSource();

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        string[] memory args = new string[](3);
        args[0] = borrowerData;
        args[1] = collateralData;
        args[2] = marketData;
        req.setArgs(args);

        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            SafeCast.toUint32(CHAINLINK_GAS_LIMIT),
            bytes32(0)
        );

        // Track pending request
        pendingRequests[requestId] = PendingRequest({
            loanId: loanId,
            timestamp: block.timestamp,
            isActive: true
        });

        emit AIRiskRequested(requestId, loanId, block.timestamp);
        return requestId;
    }

    /**
     * @notice Enhanced fulfillRequest with robust error handling and JSON parsing
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        PendingRequest storage request = pendingRequests[requestId];

        if (!request.isActive) {
            return; // Ignore if request is not active
        }

        uint256 loanId = request.loanId;
        loanRequestPending[loanId] = false;
        request.isActive = false;

        if (err.length > 0) {
            _handleRequestError(requestId, loanId, string(err));
            return;
        }

        if (response.length == 0) {
            _handleRequestError(requestId, loanId, "Empty response");
            return;
        }

        _parseAndStoreResponse(loanId, response);
    }

    /**
     * @notice Enhanced dynamic interest rate calculation with non-linear adjustments
     */
    function calculateDynamicInterestRate(
        uint256 loanId
    ) external view validLoanId(loanId) returns (uint256) {
        RiskAssessment memory assessment = loanRiskAssessments[loanId];

        if (!assessment.isValid) {
            return DEFAULT_INTEREST_RATE;
        }

        // Non-linear risk adjustment - higher penalties for very risky loans
        uint256 riskMultiplier = assessment.riskScore > 80
            ? 15
            : assessment.riskScore > 60
            ? 12
            : 10;

        uint256 riskAdjustment = (assessment.riskScore * riskMultiplier) / 10;

        // Volatility adjustment with exponential scaling for high volatility
        uint256 volatilityAdjustment = assessment.volatilityScore > 70
            ? (assessment.volatilityScore * 8)
            : (assessment.volatilityScore * 5);

        // Time-based adjustment - older assessments get higher rates
        uint256 timeAdjustment = 0;
        if (block.timestamp > assessment.timestamp + 7 days) {
            timeAdjustment = 50; // 0.5% increase for week-old assessments
        }

        uint256 totalRate = BASE_INTEREST_RATE +
            riskAdjustment +
            volatilityAdjustment +
            timeAdjustment;

        return totalRate > MAX_INTEREST_RATE ? MAX_INTEREST_RATE : totalRate;
    }

    /**
     * @notice Get comprehensive risk assessment with validity check
     */
    function getRiskAssessment(
        uint256 loanId
    )
        external
        view
        validLoanId(loanId)
        returns (
            uint256 riskScore,
            uint256 volatilityScore,
            uint256 interestRate,
            uint256 timestamp,
            bool isValid
        )
    {
        RiskAssessment memory assessment = loanRiskAssessments[loanId];
        return (
            assessment.riskScore,
            assessment.volatilityScore,
            assessment.interestRate,
            assessment.timestamp,
            assessment.isValid
        );
    }

    /**
     * @notice Check if assessment is stale and needs refresh
     */
    function isAssessmentStale(uint256 loanId) external view returns (bool) {
        RiskAssessment memory assessment = loanRiskAssessments[loanId];
        return
            !assessment.isValid ||
            (block.timestamp > assessment.timestamp + 7 days);
    }

    /**
     * @notice Clean up expired pending requests (callable by anyone)
     */
    function cleanupExpiredRequests(bytes32[] calldata requestIds) external {
        for (uint256 i = 0; i < requestIds.length; i++) {
            PendingRequest storage request = pendingRequests[requestIds[i]];
            if (
                request.isActive &&
                block.timestamp > request.timestamp + REQUEST_TIMEOUT
            ) {
                loanRequestPending[request.loanId] = false;
                request.isActive = false;

                emit RequestFailed(requestIds[i], request.loanId, "Timeout");
            }
        }
    }

    // Internal Functions

    function _buildEnhancedJavaScriptSource()
        internal
        pure
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "try {",
                    "const AWS = require('aws-sdk');",
                    "const bedrock = new AWS.BedrockRuntime();",
                    "const borrowerData = args[0];",
                    "const collateralData = args[1];",
                    "const marketData = args[2];",
                    "const prompt = `Analyze loan risk. Borrower: ${borrowerData}, Collateral: ${collateralData}, Market: ${marketData}. ",
                    'Return valid JSON: {"riskScore": 0-100, "volatilityScore": 0-100, "recommendedInterestRate": basis points}`;',
                    "const response = await bedrock.invokeModel({",
                    "modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',",
                    "body: JSON.stringify({prompt, max_tokens: 1000, temperature: 0.1})",
                    "});",
                    "const result = JSON.parse(response.body.toString());",
                    "const parsed = typeof result === 'string' ? JSON.parse(result) : result;",
                    "return Functions.encodeString(JSON.stringify({",
                    "riskScore: Math.max(0, Math.min(100, parsed.riskScore || 50)),",
                    "volatilityScore: Math.max(0, Math.min(100, parsed.volatilityScore || 50)),",
                    "recommendedInterestRate: Math.max(500, Math.min(2000, parsed.recommendedInterestRate || 1000))",
                    "}));",
                    "} catch (error) {",
                    "return Functions.encodeString(JSON.stringify({error: error.message}));",
                    "}"
                )
            );
    }

    function _parseAndStoreResponse(
        uint256 loanId,
        bytes memory response
    ) internal {
        string memory responseStr = string(response);

        // Enhanced JSON parsing with error handling
        (
            uint256 riskScore,
            uint256 volatilityScore,
            uint256 interestRate
        ) = _parseJSONResponse(responseStr);

        // Validate parsed values
        if (riskScore > MAX_RISK_SCORE || interestRate > MAX_INTEREST_RATE) {
            revert AIRiskManager__InvalidRiskScore();
        }

        // Store the assessment
        loanRiskAssessments[loanId] = RiskAssessment({
            riskScore: riskScore,
            volatilityScore: volatilityScore,
            interestRate: interestRate,
            timestamp: block.timestamp,
            isValid: true
        });

        emit RiskScoreUpdated(
            loanId,
            riskScore,
            interestRate,
            volatilityScore,
            block.timestamp
        );
    }

    function _parseJSONResponse(
        string memory response
    )
        internal
        pure
        returns (
            uint256 riskScore,
            uint256 volatilityScore,
            uint256 interestRate
        )
    {
        // Enhanced JSON parsing - production would use a proper JSON library
        riskScore = _extractValueFromJSON(response, "riskScore");
        volatilityScore = _extractValueFromJSON(response, "volatilityScore");
        interestRate = _extractValueFromJSON(
            response,
            "recommendedInterestRate"
        );

        // Apply defaults if parsing failed
        if (riskScore == 0) riskScore = DEFAULT_RISK_SCORE;
        if (volatilityScore == 0) volatilityScore = DEFAULT_VOLATILITY_SCORE;
        if (interestRate == 0) interestRate = DEFAULT_INTEREST_RATE;
    }

    function _extractValueFromJSON(
        string memory json,
        string memory key
    ) internal pure returns (uint256) {
        bytes memory jsonBytes = bytes(json);
        bytes memory keyBytes = bytes(key);

        for (uint256 i = 0; i < jsonBytes.length - keyBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < keyBytes.length; j++) {
                if (jsonBytes[i + j] != keyBytes[j]) {
                    found = false;
                    break;
                }
            }

            if (found) {
                // Look for the value after the key
                uint256 start = i + keyBytes.length;
                while (
                    start < jsonBytes.length &&
                    (jsonBytes[start] == '"' ||
                        jsonBytes[start] == ":" ||
                        jsonBytes[start] == " ")
                ) {
                    start++;
                }

                uint256 end = start;
                while (
                    end < jsonBytes.length &&
                    jsonBytes[end] >= "0" &&
                    jsonBytes[end] <= "9"
                ) {
                    end++;
                }

                if (end > start) {
                    return _bytesToUint(jsonBytes, start, end);
                }
            }
        }
        return 0;
    }

    function _bytesToUint(
        bytes memory data,
        uint256 start,
        uint256 end
    ) internal pure returns (uint256 result) {
        for (uint256 i = start; i < end; i++) {
            result = result * 10 + (uint256(uint8(data[i])) - 48);
        }
    }

    function _setFallbackRiskAssessment(uint256 loanId) internal {
        loanRiskAssessments[loanId] = RiskAssessment({
            riskScore: DEFAULT_RISK_SCORE,
            volatilityScore: DEFAULT_VOLATILITY_SCORE,
            interestRate: DEFAULT_INTEREST_RATE,
            timestamp: block.timestamp,
            isValid: true
        });

        emit RiskScoreUpdated(
            loanId,
            DEFAULT_RISK_SCORE,
            DEFAULT_INTEREST_RATE,
            DEFAULT_VOLATILITY_SCORE,
            block.timestamp
        );
    }

    function _handleRequestError(
        bytes32 requestId,
        uint256 loanId,
        string memory reason
    ) internal {
        emit RequestFailed(requestId, loanId, reason);
        _setFallbackRiskAssessment(loanId);
    }
}
