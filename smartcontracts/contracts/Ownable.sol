// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

contract Ownable {

    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier ownerOnly {
        require(msg.sender == owner, "Only the contract owner can execute action");
        _;
    }

    function changeOwner(address newOwner) public ownerOnly {
        owner = newOwner;
    }
}
