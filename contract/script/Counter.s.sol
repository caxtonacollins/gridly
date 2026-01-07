// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {GridlyGame} from "../src/GridlyGame.sol";

contract GridlyGameScript is Script {
    GridlyGame public gridlyGame;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        gridlyGame = new GridlyGame();
        vm.stopBroadcast();
    }
}
