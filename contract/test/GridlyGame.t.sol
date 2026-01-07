// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {GridlyGame} from "../src/GridlyGame.sol";

contract GridlyGameTest is Test {
    GridlyGame public gridlyGame;

    function setUp() public {
        gridlyGame = new GridlyGame();
    }
}
