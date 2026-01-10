// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GridlySubscription
 * @dev Subscription management for Gridly tiers (Free, Pro, Elite)
 * Uses USDC.e on Base for payments
 */
contract GridlySubscription is Ownable, ReentrancyGuard {
    
    enum SubscriptionTier {
        FREE,
        PRO,
        ELITE
    }

    struct SubscriptionPlan {
        uint256 priceUSDC;
        uint256 durationSeconds;
        uint256 multiplier; // In basis points (100 = 1x)
    }

    IERC20 public usdcToken;
    
    mapping(SubscriptionTier => SubscriptionPlan) public plans;
    mapping(address => SubscriptionTier) public userSubscription;
    mapping(address => uint256) public subscriptionExpiry;
    mapping(address => uint256) public totalSpent;

    uint256 public constant SUBSCRIPTION_DECIMALS = 6; // USDC decimals on Base
    
    address public treasuryAddress;

    event SubscriptionPurchased(
        address indexed player,
        SubscriptionTier tier,
        uint256 expiryTime,
        uint256 amount
    );

    event SubscriptionUpgraded(
        address indexed player,
        SubscriptionTier oldTier,
        SubscriptionTier newTier
    );

    event SubscriptionExpired(address indexed player, SubscriptionTier tier);

    constructor(address _initialOwner, address _usdcAddress, address _treasury) Ownable(_initialOwner) {
        usdcToken = IERC20(_usdcAddress);
        treasuryAddress = _treasury;
        
        // Initialize plans
        // PRO: 4.99 USD for 30 days, 1.5x multiplier
        plans[SubscriptionTier.PRO] = SubscriptionPlan({
            priceUSDC: 4_990_000, // 4.99 * 10^6
            durationSeconds: 30 days,
            multiplier: 150
        });

        // ELITE: 9.99 USD for 30 days, 2x multiplier
        plans[SubscriptionTier.ELITE] = SubscriptionPlan({
            priceUSDC: 9_990_000, // 9.99 * 10^6
            durationSeconds: 30 days,
            multiplier: 200
        });

        // FREE: No cost, 1x multiplier
        plans[SubscriptionTier.FREE] = SubscriptionPlan({
            priceUSDC: 0,
            durationSeconds: 0,
            multiplier: 100
        });
    }

    /**
     * @dev Purchase a subscription tier
     */
    function purchaseSubscription(SubscriptionTier _tier)
        external
        nonReentrant
    {
        require(_tier != SubscriptionTier.FREE, "Free tier cannot be purchased");
        
        SubscriptionPlan memory plan = plans[_tier];
        require(plan.priceUSDC > 0, "Invalid subscription tier");

        // Transfer USDC from player to treasury
        require(
            usdcToken.transferFrom(msg.sender, treasuryAddress, plan.priceUSDC),
            "Payment failed"
        );

        // Update subscription
        SubscriptionTier oldTier = userSubscription[msg.sender];
        userSubscription[msg.sender] = _tier;
        subscriptionExpiry[msg.sender] = block.timestamp + plan.durationSeconds;
        totalSpent[msg.sender] += plan.priceUSDC;

        if (oldTier != SubscriptionTier.FREE) {
            emit SubscriptionUpgraded(msg.sender, oldTier, _tier);
        } else {
            emit SubscriptionPurchased(msg.sender, _tier, subscriptionExpiry[msg.sender], plan.priceUSDC);
        }
    }

    /**
     * @dev Check current subscription status
     */
    function getSubscription(address _player)
        external
        view
        returns (SubscriptionTier tier, uint256 expiryTime)
    {
        tier = userSubscription[_player];
        expiryTime = subscriptionExpiry[_player];

        // Expired subscriptions revert to free
        if (expiryTime < block.timestamp) {
            tier = SubscriptionTier.FREE;
        }
    }

    /**
     * @dev Get reward multiplier for player
     */
    function getMultiplier(address _player)
        external
        view
        returns (uint256)
    {
        SubscriptionTier tier = userSubscription[_player];
        
        if (subscriptionExpiry[_player] < block.timestamp) {
            tier = SubscriptionTier.FREE;
        }

        return plans[tier].multiplier;
    }

    /**
     * @dev Admin: Set plan price
     */
    function setPlanPrice(SubscriptionTier _tier, uint256 _priceUSDC)
        external
        onlyOwner
    {
        plans[_tier].priceUSDC = _priceUSDC;
    }

    /**
     * @dev Admin: Update treasury address
     */
    function setTreasuryAddress(address _newTreasury) external onlyOwner {
        treasuryAddress = _newTreasury;
    }
}
