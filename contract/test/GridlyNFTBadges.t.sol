// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {GridlyNFTBadges} from "../src/GriglyNFTBadges.sol";

contract GridlyNFTBadgesTest is Test {
    GridlyNFTBadges badges;
    address ownerAddr = address(this);
    address player = address(0xA11CE);

    function setUp() public {
        badges = new GridlyNFTBadges(ownerAddr);
        // Register FIRST_WIN badge
        badges.registerBadge(
            GridlyNFTBadges.BadgeType.FIRST_WIN,
            "First Win",
            "Awarded for winning first puzzle",
            "ipfs://firstwin"
        );
    }

    function testMintBadgeOnlyOnce() public {
        uint256 tokenId = badges.mintBadge(player, GridlyNFTBadges.BadgeType.FIRST_WIN);
        assertTrue(badges.hasBadge(player, GridlyNFTBadges.BadgeType.FIRST_WIN));
        assertEq(badges.ownerOf(tokenId), player);
        assertEq(badges.tokenURI(tokenId), "ipfs://firstwin");

        // Cannot mint again
        vm.expectRevert(bytes("Player already has this badge"));
        badges.mintBadge(player, GridlyNFTBadges.BadgeType.FIRST_WIN);
    }

    function testOnlyOwnerCanMint() public {
        vm.prank(address(0xBEEF));
        vm.expectRevert();
        badges.mintBadge(player, GridlyNFTBadges.BadgeType.FIRST_WIN);
    }
}
