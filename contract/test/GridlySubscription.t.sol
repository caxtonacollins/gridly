// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import {GridlySubscription} from "../src/GridlySubcription.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("USDC", "USDC") {}
    function decimals() public view override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract GridlySubscriptionTest is Test {
    GridlySubscription sub;
    MockUSDC usdc;
    address treasury = address(0x9999);
    address ownerAddr = address(this);
    address user = address(0xBEEF);

    function setUp() public {
        usdc = new MockUSDC();
        sub = new GridlySubscription(ownerAddr, address(usdc), treasury);
        // fund user
        usdc.mint(user, 100_000_000); // 100 USDC
        vm.prank(user);
        usdc.approve(address(sub), type(uint256).max);
    }

    function testPurchaseProSubscription() public {
        uint256 start = block.timestamp;
        vm.prank(user);
        sub.purchaseSubscription(GridlySubscription.SubscriptionTier.PRO);

        (GridlySubscription.SubscriptionTier tier, uint256 expiry) = sub.getSubscription(user);
        assertEq(uint256(tier), uint256(GridlySubscription.SubscriptionTier.PRO));
        assertEq(expiry, start + 30 days);

        // totalSpent
        assertEq(sub.totalSpent(user), 4_990_000);

        // funds transferred to treasury
        assertEq(usdc.balanceOf(treasury), 4_990_000);
    }

    function testGetMultiplierAndExpiry() public {
        vm.prank(user);
        sub.purchaseSubscription(GridlySubscription.SubscriptionTier.ELITE);
        uint256 m = sub.getMultiplier(user);
        assertEq(m, 200);

        // After expiry
        vm.warp(block.timestamp + 31 days);
        m = sub.getMultiplier(user);
        assertEq(m, 100);

        (GridlySubscription.SubscriptionTier tier, ) = sub.getSubscription(user);
        assertEq(uint256(tier), uint256(GridlySubscription.SubscriptionTier.FREE));
    }

    function testOnlyOwnerSetters() public {
        // Non-owner cannot change price
        address attacker = address(0x1234);
        vm.prank(attacker);
        vm.expectRevert();
        sub.setPlanPrice(GridlySubscription.SubscriptionTier.PRO, 1);

        // Owner can change price
        sub.setPlanPrice(GridlySubscription.SubscriptionTier.PRO, 5_000_000);
        (uint256 price,,) = sub.plans(GridlySubscription.SubscriptionTier.PRO);
        assertEq(price, 5_000_000);

        // Update treasury
        address newTreasury = address(0x7777);
        sub.setTreasuryAddress(newTreasury);
        assertEq(sub.treasuryAddress(), newTreasury);
    }

    function testSetTreasuryZeroReverts() public {
        vm.expectRevert(bytes("Invalid treasury"));
        sub.setTreasuryAddress(address(0));
    }
}
