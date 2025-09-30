// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Counter.sol";

contract CounterFactory {
    mapping(address => address) public userCounters;

    event CounterCreated(address indexed user, address counter);

    function deploy() external {
        require(userCounters[msg.sender] == address(0), "Already deployed");

        Counter counter = new Counter();
        userCounters[msg.sender] = address(counter);

        emit CounterCreated(msg.sender, address(counter));
    }

    function getCounter(address user) external view returns (address) {
        return userCounters[user];
    }
}
