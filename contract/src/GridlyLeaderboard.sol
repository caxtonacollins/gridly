// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title GridlyLeaderboard
/// @notice Minimal onchain leaderboard storing best (lowest) solve time per round.
/// @dev No owner, no admin, anyone can submit. Stores only the best time and its player.
contract GridlyLeaderboard {
    struct Entry {
        address player;
        uint32 bestTimeMs; // milliseconds, 0 means no score
    }

    /// @notice Best entry per roundId
    mapping(uint256 => Entry) public bestForRound;

    /// @notice Emitted when a new best score is recorded for a round
    event BestScoreUpdated(uint256 indexed roundId, address indexed player, uint32 bestTimeMs);

    /// @dev Simple sanity limits to reject obviously invalid times
    uint32 public constant MIN_TIME_MS = 50; // 50ms floor
    uint32 public constant MAX_TIME_MS = 600_000; // 10 minutes ceiling

    /// @notice Submit a time for a round. Replaces stored score only if strictly better (lower).
    /// @param roundId The identifier of the round (e.g., epoch day for Daily or offset id for Round Mode)
    /// @param timeMs The solve time in milliseconds
    function submitScore(uint256 roundId, uint32 timeMs) external {
        require(timeMs >= MIN_TIME_MS && timeMs <= MAX_TIME_MS, "Invalid time");

        Entry memory current = bestForRound[roundId];
        if (current.bestTimeMs == 0 || timeMs < current.bestTimeMs) {
            bestForRound[roundId] = Entry({player: msg.sender, bestTimeMs: timeMs});
            emit BestScoreUpdated(roundId, msg.sender, timeMs);
        }
    }

    /// @notice Get best entry for a round.
    function getBestForRound(uint256 roundId) external view returns (Entry memory) {
        return bestForRound[roundId];
    }
}
