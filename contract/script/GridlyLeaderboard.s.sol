// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {GridlyLeaderboard} from "../src/GridlyLeaderboard.sol";

contract GridlyLeaderboardScript is Script {
    function run() external returns (GridlyLeaderboard deployed) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        deployed = new GridlyLeaderboard();
        vm.stopBroadcast();

        console2.log("GridlyLeaderboard deployed at:", address(deployed));
    }
}
