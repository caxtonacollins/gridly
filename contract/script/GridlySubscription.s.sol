// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {GridlySubscription} from "../src/GridlySubcription.sol";

contract GridlySubscriptionScript is Script {
    function run() external returns (GridlySubscription) {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // USDC contract address on Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
        // USDC contract address on Base Mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
        address usdcAddress = vm.envAddress("USDC_ADDRESS");
        
        // Treasury address - where subscription payments will be sent
        address treasury = vm.envAddress("TREASURY_ADDRESS");
        
        // Initial owner address (can be same as deployer or different)
        address initialOwner = vm.envAddress("OWNER_ADDRESS");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        GridlySubscription subscription = new GridlySubscription(
            initialOwner,
            usdcAddress,
            treasury
        );
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        console2.log("GridlySubscription deployed at:", address(subscription));
        
        return subscription;
    }
}
