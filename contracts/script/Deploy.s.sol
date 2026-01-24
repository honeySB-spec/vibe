// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ConsensusRegistry.sol";

contract DeployScript is Script {
    function run() external {
        // Retrieve private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the contract
        ConsensusRegistry registry = new ConsensusRegistry();

        vm.stopBroadcast();
        
        // Log the address so you can copy it
        console.log("ConsensusRegistry deployed at:", address(registry));
    }
}