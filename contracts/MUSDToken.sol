// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MUSDToken
 * @dev Custom MUSD token for hackathon demo
 * This token can be minted by the MezoVaultContract to simulate the borrowing flow
 * WARNING: This is for DEMO purposes only. Real Mezo uses official MUSD token.
 */
contract MUSDToken is ERC20, Ownable {
    // Addresses that can mint/burn tokens
    mapping(address => bool) public minters;
    
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    constructor() ERC20("Mock USD", "MUSD") Ownable(msg.sender) {
        minters[msg.sender] = true;
    }
    
    /**
     * @dev Add a minter address (only owner)
     * @param minter Address that will be able to mint tokens
     */
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter address (only owner)
     * @param minter Address that will no longer be able to mint tokens
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Mint tokens to an address
     * @param to Address to receive tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(minters[msg.sender], "MUSDToken: not a minter");
        require(amount > 0, "MUSDToken: amount must be greater than 0");
        
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from an address
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external {
        require(minters[msg.sender], "MUSDToken: not a minter");
        require(amount > 0, "MUSDToken: amount must be greater than 0");
        
        _burn(from, amount);
    }
    
    /**
     * @dev Override decimals to 18 (standard for stablecoins)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}

