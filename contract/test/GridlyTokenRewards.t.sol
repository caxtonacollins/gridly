// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {GridlyToken, GridlyRewardDistributor} from "../src/GridlyTokenRewards.sol";

contract GridlyTokenRewardsTest is Test {
    GridlyToken token;
    GridlyRewardDistributor dist;
    address ownerAddr = address(this);
    address player = address(0xCAFEBABE);

    function setUp() public {
        token = new GridlyToken(ownerAddr);
        dist = new GridlyRewardDistributor(ownerAddr, address(token));

        // fund distributor with tokens
        token.transfer(address(dist), 1000 ether);
    }

    function testAddAndClaimRewards() public {
        // only owner can add
        vm.prank(address(0xB));
        vm.expectRevert();
        dist.addReward(player, 150);

        // owner adds
        dist.addReward(player, 150); // 10 * 1.5 tokens

        assertEq(dist.pendingRewards(player), 15 ether);

        // player claims
        vm.prank(player);
        dist.claimRewards();

        assertEq(dist.pendingRewards(player), 0);
        assertEq(dist.claimedRewards(player), 15 ether);
        assertEq(token.balanceOf(player), 15 ether);
    }

    function testGetTotalRewards() public {
        dist.addReward(player, 200); // 20 tokens
        assertEq(dist.getTotalRewards(player), 20 ether);
        vm.prank(player);
        dist.claimRewards();
        assertEq(dist.getTotalRewards(player), 20 ether);
    }
}
