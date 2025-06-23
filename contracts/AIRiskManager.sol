// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract AIRiskManager is FunctionsClient, Ownable {
    using FunctionsRequest for FunctionsRequest.Request;

    // Custom Errors
    error AIRiskManager__InvalidLoanId();
    error AIRiskManager__InvalidRiskScore();
    error AIRiskManager__InvalidInterestRate();
    error AIRiskManager__NotAuthorized();
    error AIRiskManager__InvalidSubscriptionId();

    // State Variables
    uint64 public subscriptionId;
    address public loanManager;

    // Risk scoring parameters
    uint256 public constant MIN_RISK_SCORE = 0;
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant BASE_INTEREST_RATE = 500; // 5% base rate
    uint256 public constant MAX_INTEREST_RATE = 2000; // 20% max rate
    uint256 public constant DEFAULT_RISK_SCORE = 50;
    uint256 public constant DEFAULT_VOLATILITY_SCORE = 50;
    uint256 public constant DEFAULT_INTEREST_RATE = 1000; // 10%
    uint256 public constant ASCII_ZERO = 48;
    uint256 public constant ASCII_NINE = 57;
    uint256 public constant PATTERN_LENGTH = 9;
    uint256 public constant RISK_SCORE_OFFSET = 11;
    uint256 public constant CHAINLINK_GAS_LIMIT = 200000;

    // Mappings
    mapping(uint256 => uint256) public loanRiskScores; // loanId => risk score
    mapping(uint256 => uint256) public loanInterestRates; // loanId => interest rate
    mapping(uint256 => uint256) public loanVolatilityScores; // loanId => volatility
    mapping(bytes32 => uint256) public requestIdToLoanId;

    // Events
    event RiskScoreUpdated(
        uint256 indexed loanId,
        uint256 riskScore,
        uint256 interestRate
    );
    event VolatilityUpdated(uint256 indexed loanId, uint256 volatilityScore);
    event AIRiskRequested(bytes32 indexed requestId, uint256 loanId);

    constructor(address router) FunctionsClient(router) Ownable(msg.sender) {}

    modifier onlyLoanManager() {
        if (msg.sender != loanManager) revert AIRiskManager__NotAuthorized();
        _;
    }

    function setSubscriptionId(uint64 _subscriptionId) external onlyOwner {
        if (_subscriptionId == 0) revert AIRiskManager__InvalidSubscriptionId();
        subscriptionId = _subscriptionId;
    }

    function setLoanManager(address _loanManager) external onlyOwner {
        if (_loanManager == address(0)) revert AIRiskManager__NotAuthorized();
        loanManager = _loanManager;
    }

    /**
     * @notice Request AI risk assessment for a loan
     * @param loanId The loan ID to assess
     * @param borrowerData Encoded borrower data (credit score, income, etc.)
     * @param collateralData Encoded collateral data (type, value, volatility)
     * @param marketData Encoded market data (interest rates, economic indicators)
     */
    function requestRiskAssessment(
        uint256 loanId,
        string calldata borrowerData,
        string calldata collateralData,
        string calldata marketData
    ) external onlyLoanManager returns (bytes32) {
        if (loanId == 0) revert AIRiskManager__InvalidLoanId();

        string memory source = string(
            abi.encode(
                "const AWS = require('aws-sdk');",
                "const bedrock = new AWS.BedrockRuntime();",
                "const borrowerData = args[0];",
                "const collateralData = args[1];",
                "const marketData = args[2];",
                "const prompt = `Analyze loan risk for borrower: ${borrowerData}, collateral: ${collateralData}, market: ${marketData}. Return JSON with riskScore (0-100), volatilityScore (0-100), and recommendedInterestRate (basis points).`;",
                "const response = await bedrock.invokeModel({",
                "  modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',",
                "  body: JSON.stringify({",
                "    prompt: prompt,",
                "    max_tokens: 1000,",
                "    temperature: 0.1",
                "  })",
                "});",
                "const result = JSON.parse(response.body.toString());",
                "return Functions.encodeString(JSON.stringify(result));"
            )
        );

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
            uint32(CHAINLINK_GAS_LIMIT),
            bytes32(0)
        );

        requestIdToLoanId[requestId] = loanId;
        emit AIRiskRequested(requestId, loanId);

        return requestId;
    }

    /**
     * @notice Chainlink callback for fulfilled risk assessment requests
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (err.length > 0) {
            revert AIRiskManager__InvalidRiskScore();
        }

        uint256 loanId = requestIdToLoanId[requestId];
        if (loanId == 0) revert AIRiskManager__InvalidLoanId();

        // Decode AI response
        string memory result = string(response);
        // Parse JSON response (simplified - in production use proper JSON parsing)
        // Expected format: {"riskScore": 75, "volatilityScore": 60, "recommendedInterestRate": 1200}

        // For demo purposes, extract values from response
        uint256 riskScore = extractRiskScore(result);
        uint256 volatilityScore = extractVolatilityScore(result);
        uint256 recommendedRate = extractInterestRate(result);

        // Validate scores
        if (riskScore > MAX_RISK_SCORE)
            revert AIRiskManager__InvalidRiskScore();
        if (recommendedRate > MAX_INTEREST_RATE)
            revert AIRiskManager__InvalidInterestRate();

        // Store results
        loanRiskScores[loanId] = riskScore;
        loanVolatilityScores[loanId] = volatilityScore;
        loanInterestRates[loanId] = recommendedRate;

        emit RiskScoreUpdated(loanId, riskScore, recommendedRate);
        emit VolatilityUpdated(loanId, volatilityScore);
    }

    /**
     * @notice Calculate dynamic interest rate based on risk factors
     * @param loanId The loan ID
     * @return The calculated interest rate in basis points
     */
    function calculateDynamicInterestRate(
        uint256 loanId
    ) external view returns (uint256) {
        uint256 riskScore = loanRiskScores[loanId];
        uint256 volatilityScore = loanVolatilityScores[loanId];

        // Base rate + risk adjustment + volatility adjustment
        uint256 riskAdjustment = (riskScore * 10); // 0-1000 basis points
        uint256 volatilityAdjustment = (volatilityScore * 5); // 0-500 basis points

        uint256 totalRate = BASE_INTEREST_RATE +
            riskAdjustment +
            volatilityAdjustment;

        // Cap at maximum rate
        if (totalRate > MAX_INTEREST_RATE) {
            totalRate = MAX_INTEREST_RATE;
        }

        return totalRate;
    }

    /**
     * @notice Get comprehensive risk assessment for a loan
     * @param loanId The loan ID
     * @return riskScore The risk score (0-100)
     * @return volatilityScore The volatility score (0-100)
     * @return interestRate The calculated interest rate
     */
    function getRiskAssessment(
        uint256 loanId
    )
        external
        view
        returns (
            uint256 riskScore,
            uint256 volatilityScore,
            uint256 interestRate
        )
    {
        return (
            loanRiskScores[loanId],
            loanVolatilityScores[loanId],
            loanInterestRates[loanId]
        );
    }

    // Helper functions for parsing AI response (simplified)
    function extractRiskScore(
        string memory response
    ) internal pure returns (uint256) {
        bytes memory responseBytes = bytes(response);
        for (uint256 i = 0; i < responseBytes.length - PATTERN_LENGTH + 1; i++) {
            // Check for "riskScore" pattern
            if (i + PATTERN_LENGTH <= responseBytes.length) {
                bytes memory pattern = new bytes(PATTERN_LENGTH);
                for (uint256 j = 0; j < PATTERN_LENGTH; j++) {
                    pattern[j] = responseBytes[i + j];
                }
                if (keccak256(pattern) == keccak256("riskScore")) {
                    // Extract number after "riskScore":
                    uint256 start = i + RISK_SCORE_OFFSET;
                    uint256 end = start;
                    while (
                        end < responseBytes.length &&
                        uint8(responseBytes[end]) >= ASCII_ZERO &&
                        uint8(responseBytes[end]) <= ASCII_NINE
                    ) {
                        end++;
                    }
                    if (end > start) {
                        bytes memory scoreBytes = new bytes(end - start);
                        for (uint256 k = 0; k < end - start; k++) {
                            scoreBytes[k] = responseBytes[start + k];
                        }
                        string memory scoreStr = string(scoreBytes);
                        return stringToUint(scoreStr);
                    }
                }
            }
        }
        return DEFAULT_RISK_SCORE; // Default risk score
    }

    function extractVolatilityScore(
        string memory /* response */
    ) internal pure returns (uint256) {
        // Simplified implementation for now
        return DEFAULT_VOLATILITY_SCORE; // Default volatility score
    }

    function extractInterestRate(
        string memory /* response */
    ) internal pure returns (uint256) {
        // Simplified implementation for now
        return DEFAULT_INTEREST_RATE; // Default interest rate (10%)
    }

    function stringToUint(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            uint256 c = uint256(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
        return result;
    }
}
