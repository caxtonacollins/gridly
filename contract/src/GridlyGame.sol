// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Gridly Game Contract - Minimal Version
 * @notice Ultra-minimal on-chain game - only stores wins for proof
 * @dev All stats, leaderboards, and history stored off-chain in backend
 */
contract GridlyGame {
    // Round duration in seconds (3 minutes)
    uint256 public constant ROUND_DURATION = 180;
    
    // Deployment timestamp
    uint256 public immutable deploymentTime;
    
    // Only store: player -> round -> won (true/false)
    // This is the minimal proof needed on-chain
    mapping(address => mapping(uint256 => bool)) public hasWon;
    
    // Track if player already played this round (prevent double plays)
    mapping(address => mapping(uint256 => bool)) public hasPlayed;
    
    // Events for backend to index
    event GamePlayed(
        address indexed player,
        uint256 indexed roundId,
        bool won,
        uint8 guessedCell,
        uint256 timeMs,
        uint256 timestamp
    );
    
    constructor() {
        deploymentTime = block.timestamp;
    }
    
    /**
     * @notice Get the current round ID
     */
    function getCurrentRound() public view returns (uint256) {
        return (block.timestamp - deploymentTime) / ROUND_DURATION;
    }
    
    /**
     * @notice Get the solution cell for a given round (deterministic)
     */
    function getSolutionForRound(uint256 roundId) public pure returns (uint8) {
        uint256 seed = uint256(keccak256(abi.encodePacked(roundId, "gridly")));
        return uint8(seed % 16); // 16 cells in 4x4 grid
    }
    
    /**
     * @notice Submit game result - minimal storage, backend handles rest
     * @param guessedCell The cell index (0-15)
     * @param timeMs Time taken in milliseconds (for event only)
     */
    function playRound(uint8 guessedCell, uint256 timeMs) external {
        uint256 currentRound = getCurrentRound();
        
        require(!hasPlayed[msg.sender][currentRound], "Already played");
        require(guessedCell < 16, "Invalid cell");
        
        // Mark as played
        hasPlayed[msg.sender][currentRound] = true;
        
        // Check if won
        uint8 solution = getSolutionForRound(currentRound);
        bool won = guessedCell == solution;
        
        // Only store win status (minimal storage)
        if (won) {
            hasWon[msg.sender][currentRound] = true;
        }
        
        // Emit event for backend to index everything else
        emit GamePlayed(
            msg.sender,
            currentRound,
            won,
            guessedCell,
            timeMs,
            block.timestamp
        );
    }
    
    /**
     * @notice Check if player won a specific round
     */
    function didPlayerWin(address player, uint256 roundId) external view returns (bool) {
        return hasWon[player][roundId];
    }
    
    /**
     * @notice Check if player already played this round
     */
    function didPlayerPlay(address player, uint256 roundId) external view returns (bool) {
        return hasPlayed[player][roundId];
    }
}