// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {GridlyLeaderboard} from "../src/GridlyLeaderboard.sol";

contract GridlyLeaderboardScript is Script {
    function run() external returns (GridlyLeaderboard) {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address initialOwner = 0x47915Cf5165227fB865cFb469C9EB406C793cCE2;
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        GridlyLeaderboard leaderboard = new GridlyLeaderboard(initialOwner);
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        console2.log("GridlyLeaderboard deployed at:", address(leaderboard));
        
        return leaderboard;
    }
}
