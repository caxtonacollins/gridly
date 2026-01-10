// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GridlyToken
 * @dev ERC20 token for Gridly game rewards (GRIDLY token)
 */
contract GridlyToken is ERC20, Ownable {
    constructor(
        address _initialOwner
    ) ERC20("Gridly", "GRIDLY") Ownable(_initialOwner) {
        // Mint initial supply: 1 million tokens
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}

/**
 * @title GridlyRewardDistributor
 * @dev Manages token reward claims for puzzle victories
 */
contract GridlyRewardDistributor is Ownable, ReentrancyGuard {
    GridlyToken public gridlyToken;

    struct RewardMultiplier {
        uint256 free; // 1x
        uint256 pro; // 1.5x
        uint256 elite; // 2x
    }

    RewardMultiplier public multipliers =
        RewardMultiplier({free: 100, pro: 150, elite: 200});

    uint256 public baseRewardPerWin = 10 * 10 ** 18; // 10 GRIDLY tokens

    mapping(address => uint256) public pendingRewards;
    mapping(address => uint256) public claimedRewards;

    event RewardClaimed(address indexed player, uint256 amount);
    event RewardAdded(address indexed player, uint256 amount);
    event MultiplierUpdated(string tier, uint256 newMultiplier);


    constructor(
        address _initialOwner,
        address _gridlyToken
    ) Ownable(_initialOwner) {
        gridlyToken = GridlyToken(_gridlyToken);
    }

    /**
     * @dev Add pending reward for player
     * Called by game contract after validating puzzle completion
     */
    function addReward(
        address _player,
        uint256 _multiplierBps
    ) external onlyOwner {
        require(_player != address(0), "Invalid player");

        uint256 reward = (baseRewardPerWin * _multiplierBps) / 100;
        pendingRewards[_player] += reward;

        emit RewardAdded(_player, reward);
    }

    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external nonReentrant {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No pending rewards");

        pendingRewards[msg.sender] = 0;
        claimedRewards[msg.sender] += amount;

        require(gridlyToken.transfer(msg.sender, amount), "Transfer failed");
        emit RewardClaimed(msg.sender, amount);
    }

    /**
     * @dev Get player's total rewards (pending + claimed)
     */
    function getTotalRewards(address _player) external view returns (uint256) {
        return pendingRewards[_player] + claimedRewards[_player];
    }

    /**
     * @dev Update multipliers (admin)
     */
    function setMultipliers(
        uint256 _free,
        uint256 _pro,
        uint256 _elite
    ) external onlyOwner {
        multipliers = RewardMultiplier(_free, _pro, _elite);
        emit MultiplierUpdated("free", _free);
        emit MultiplierUpdated("pro", _pro);
        emit MultiplierUpdated("elite", _elite);
    }
}
