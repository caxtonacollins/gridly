// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {GridlyLeaderboard} from "../src/GridlyLeaderboard.sol";

contract GridlyLeaderboardTest is Test {
    GridlyLeaderboard lb;
    address player1 = address(0x1);
    address player2 = address(0x2);
    address player3 = address(0x3);

    function setUp() public {
        lb = new GridlyLeaderboard(address(this));
    }

    function testSubmitBestForRoundUpdatesOnlyForBetterTimes() public {
        uint256 roundId = 1;
        // valid time
        lb.submitScore(roundId, uint32(1000));
        (address bestPlayer, uint32 bestTime) = readBest(roundId);
        assertEq(bestPlayer, address(this));
        assertEq(bestTime, 1000);

        // worse time should not update
        vm.prank(player1);
        lb.submitScore(roundId, uint32(1500));
        (bestPlayer, bestTime) = readBest(roundId);
        assertEq(bestPlayer, address(this));
        assertEq(bestTime, 1000);

        // better time should update
        vm.prank(player1);
        lb.submitScore(roundId, uint32(900));
        (bestPlayer, bestTime) = readBest(roundId);
        assertEq(bestPlayer, player1);
        assertEq(bestTime, 900);
    }

    function testSubmitBestForRoundRejectsOutOfRange() public {
        uint256 roundId = 2;
        vm.expectRevert(bytes("Invalid time"));
        lb.submitScore(roundId, uint32(10)); // below MIN_TIME_MS

        vm.expectRevert(bytes("Invalid time"));
        lb.submitScore(roundId, type(uint32).max); // above MAX_TIME_MS
    }

    function testSubmitScoreAddsAndSortsLeaderboardAndStats() public {
        uint256 roundId = 3;
        // create two players submissions with different times
        vm.prank(player1);
        lb.submitScore(roundId, 3000, 10);

        vm.prank(player2);
        lb.submitScore(roundId, 2000, 10);

        vm.prank(player3);
        lb.submitScore(roundId, 1000, 10);

        // verify order ascending time
        GridlyLeaderboard.Score[] memory top = lb.getLeaderboard(roundId, 3);
        assertEq(top.length, 3);
        assertEq(top[0].player, player3);
        assertEq(top[0].timeMs, 1000);
        assertEq(top[1].player, player2);
        assertEq(top[1].timeMs, 2000);
        assertEq(top[2].player, player1);
        assertEq(top[2].timeMs, 3000);

        // rank
        assertEq(lb.getPlayerRank(roundId, player3), 1);
        assertEq(lb.getPlayerRank(roundId, address(0xDead)), 0);
    }

    function testSubmitScoreRequiresTimeAndScoreGreaterThanZero() public {
        uint256 roundId = 4;

        vm.expectRevert(bytes("Score must be greater than 0"));
        lb.submitScore(roundId, 1000, 0);

        vm.expectRevert(bytes("Time must be greater than 0"));
        lb.submitScore(roundId, 0, 1);
    }

    function testSubmitScoreThreeArgRejectsOutOfRange() public {
        uint256 roundId = 42;
        // below min
        vm.expectRevert(bytes("Invalid time"));
        lb.submitScore(roundId, 10, 1);

        // above max
        vm.expectRevert(bytes("Invalid time"));
        lb.submitScore(roundId, 700_000, 1);
    }

    function testPlayerStatsBestTimeAndStreaks() public {
        uint256 roundId = 5;
        // first win
        vm.warp(1000);
        vm.prank(player1);
        lb.submitScore(roundId, 1200, 10);

        GridlyLeaderboard.PlayerStats memory stats = lb.getPlayerStats(player1);
        assertEq(stats.totalRounds, 1);
        assertEq(stats.totalWins, 1);
        assertEq(stats.bestTime, 1200);
        assertEq(stats.currentStreak, 1);
        assertEq(stats.bestStreak, 1);
        assertEq(stats.lastWinTime, 1000);

        // within a day -> streak++ and better time updates bestTime
        vm.warp(1000 + 12 hours);
        vm.prank(player1);
        lb.submitScore(roundId, 1100, 10);

        stats = lb.getPlayerStats(player1);
        assertEq(stats.totalRounds, 2);
        assertEq(stats.totalWins, 2);
        assertEq(stats.bestTime, 1100);
        assertEq(stats.currentStreak, 2);
        assertEq(stats.bestStreak, 2);

        // after >1 day -> streak reset to 1
        vm.warp(1000 + 2 days);
        vm.prank(player1);
        lb.submitScore(roundId, 1050, 10);
        stats = lb.getPlayerStats(player1);
        assertEq(stats.currentStreak, 1);
    }

    function testLeaderboardCapOf100() public {
        uint256 roundId = 6;
        // Fill 100 entries with increasing times (slowest last)
        for (uint256 i = 0; i < 100; i++) {
            address p = address(uint160(i + 1));
            vm.prank(p);
            lb.submitScore(roundId, 10_000 + i, 10);
        }
        GridlyLeaderboard.Score[] memory top = lb.getLeaderboard(roundId, 101);
        assertEq(top.length, 100);

        // New submission faster than worst should be included and sorted to front
        address newPlayer = address(0xABCD);
        vm.prank(newPlayer);
        lb.submitScore(roundId, 9_999, 10);
        top = lb.getLeaderboard(roundId, 200);
        assertEq(top.length, 100);
        assertEq(top[0].player, newPlayer);
        assertEq(top[0].timeMs, 9_999);
    }

    function readBest(uint256 roundId) internal view returns (address, uint32) {
        GridlyLeaderboard.Entry memory e = lb.getBestForRound(roundId);
        return (e.player, e.bestTimeMs);
    }
}
