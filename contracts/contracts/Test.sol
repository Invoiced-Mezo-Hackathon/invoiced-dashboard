// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Test {
    string public greeting = "Hello, Mezo!";
    
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
}
