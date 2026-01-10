// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GridlyLeaderboard
 * @dev Manages game scores and leaderboard for Gridly on Base
 * Tracks performance across daily and round game modes
 */
contract GridlyLeaderboard is Ownable, ReentrancyGuard {
    struct Score {
        address player;
        uint256 roundId;
        uint256 timeMs;
        uint256 score;
        uint256 timestamp;
    }

    struct RoundLeaderboard {
        Score[] entries;
        mapping(address => uint256) bestScore;
        uint256 totalScores;
    }

    mapping(uint256 => RoundLeaderboard) public roundLeaderboards;

    // Track all-time stats per player
    mapping(address => PlayerStats) public playerStats;

    struct PlayerStats {
        uint256 totalWins;
        uint256 totalRounds;
        uint256 currentStreak;
        uint256 bestStreak;
        uint256 bestTime;
        uint256 lastWinTime;
    }

    uint256 public constant MAX_LEADERBOARD_SIZE = 100;

    event ScoreSubmitted(
        address indexed player,
        uint256 indexed roundId,
        uint256 timeMs,
        uint256 score,
        uint256 timestamp
    );

    event LeaderboardUpdated(
        uint256 indexed roundId,
        address indexed player,
        uint256 newRank
    );

    // ===== per-round best time store =====
    struct Entry {
        address player;
        uint32 bestTimeMs; // milliseconds, 0 means no score
    }

    // Best entry per roundId
    mapping(uint256 => Entry) public bestForRound;

    // Emitted when a new best score is recorded for a round
    event BestScoreUpdated(
        uint256 indexed roundId,
        address indexed player,
        uint32 bestTimeMs
    );

    // Simple sanity limits to reject obviously invalid times
    uint32 public constant MIN_TIME_MS = 50; // 50ms
    uint32 public constant MAX_TIME_MS = 600_000; // 10 minutes

    constructor(address _initialOwner) Ownable(_initialOwner) {}

    // Overloaded submitScore matching the frontend ABI: (roundId, timeMs)
    function submitScore(uint256 roundId, uint32 timeMs) external {
        require(timeMs >= MIN_TIME_MS && timeMs <= MAX_TIME_MS, "Invalid time");

        Entry memory current = bestForRound[roundId];
        if (current.bestTimeMs == 0 || timeMs < current.bestTimeMs) {
            bestForRound[roundId] = Entry({
                player: msg.sender,
                bestTimeMs: timeMs
            });
            emit BestScoreUpdated(roundId, msg.sender, timeMs);
        }
    }

    function getBestForRound(
        uint256 roundId
    ) external view returns (Entry memory) {
        return bestForRound[roundId];
    }

    /**
     * @dev Submit a score to the leaderboard for a specific round
     */
    function submitScore(
        uint256 _roundId,
        uint256 _timeMs,
        uint256 _score
    ) external nonReentrant {
        require(_score > 0, "Score must be greater than 0");
        require(_timeMs > 0, "Time must be greater than 0");
        // Enforce same time bounds as the 2-arg submitScore overload
        require(
            _timeMs >= MIN_TIME_MS && _timeMs <= MAX_TIME_MS,
            "Invalid time"
        );

        RoundLeaderboard storage round = roundLeaderboards[_roundId];

        // Update player stats
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalRounds++;

        if (_timeMs < stats.bestTime || stats.bestTime == 0) {
            stats.bestTime = _timeMs;
        }

        // Update streak
        if (block.timestamp - stats.lastWinTime <= 1 days) {
            stats.currentStreak++;
        } else {
            stats.currentStreak = 1;
        }

        if (stats.currentStreak > stats.bestStreak) {
            stats.bestStreak = stats.currentStreak;
        }

        stats.totalWins++;
        stats.lastWinTime = block.timestamp;

        // Add to leaderboard if within top entries
        Score memory newScore = Score({
            player: msg.sender,
            roundId: _roundId,
            timeMs: _timeMs,
            score: _score,
            timestamp: block.timestamp
        });

        if (round.entries.length < MAX_LEADERBOARD_SIZE) {
            round.entries.push(newScore);
        } else if (_timeMs < round.entries[MAX_LEADERBOARD_SIZE - 1].timeMs) {
            round.entries[MAX_LEADERBOARD_SIZE - 1] = newScore;
        }

        // Sort leaderboard by time (ascending = fastest wins)
        sortLeaderboard(_roundId);

        round.bestScore[msg.sender] = _score;

        emit ScoreSubmitted(
            msg.sender,
            _roundId,
            _timeMs,
            _score,
            block.timestamp
        );
        emit LeaderboardUpdated(
            _roundId,
            msg.sender,
            getPlayerRank(_roundId, msg.sender)
        );
    }

    /**
     * @dev Get current leaderboard for a round
     */
    function getLeaderboard(
        uint256 _roundId,
        uint256 _limit
    ) external view returns (Score[] memory) {
        RoundLeaderboard storage round = roundLeaderboards[_roundId];
        uint256 length = _limit > round.entries.length
            ? round.entries.length
            : _limit;

        Score[] memory result = new Score[](length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = round.entries[i];
        }
        return result;
    }

    /**
     * @dev Get player's rank in a round
     */
    function getPlayerRank(
        uint256 _roundId,
        address _player
    ) public view returns (uint256) {
        RoundLeaderboard storage round = roundLeaderboards[_roundId];
        for (uint256 i = 0; i < round.entries.length; i++) {
            if (round.entries[i].player == _player) {
                return i + 1;
            }
        }
        return 0; // Not ranked
    }

    /**
     * @dev Get player stats
     */
    function getPlayerStats(
        address _player
    ) external view returns (PlayerStats memory) {
        return playerStats[_player];
    }

    /**
     * @dev Simple bubble sort for leaderboard by time (gas intensive, use off-chain for large datasets)
     */
    function sortLeaderboard(uint256 _roundId) internal {
        RoundLeaderboard storage round = roundLeaderboards[_roundId];
        uint256 n = round.entries.length;
        if (n < 2) return;

        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                if (round.entries[j].timeMs > round.entries[j + 1].timeMs) {
                    Score memory temp = round.entries[j];
                    round.entries[j] = round.entries[j + 1];
                    round.entries[j + 1] = temp;
                }
            }
        }
    }
}
