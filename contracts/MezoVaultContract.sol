// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Interface for MUSDToken with mint/burn capabilities
interface IMUSDToken {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

/**
 * @title MezoVaultContract
 * @dev A vault contract that integrates with Mezo's MUSD system
 * This contract allows users to deposit BTC collateral and borrow MUSD
 */
contract MezoVaultContract is ReentrancyGuard, Ownable {
    // MUSD token contract address (will be set during deployment)
    address public musdToken;
    
    // Minimum collateral ratio (110%)
    uint256 public constant MIN_COLLATERAL_RATIO = 110;
    
    // Interest rate (2.5% annually)
    uint256 public constant INTEREST_RATE = 250; // 2.5% in basis points
    
    // BTC price in USD (for demo purposes, set to $50,000)
    uint256 public constant BTC_PRICE_USD = 50000;
    
    // User vault data
    struct Vault {
        uint256 collateralAmount; // BTC amount (in wei)
        uint256 borrowedAmount;   // MUSD amount (in wei)
        uint256 lastUpdateTime;  // Last interest calculation time
        bool exists;
    }
    
    // Mapping from user address to vault data
    mapping(address => Vault) public vaults;
    
    // Total collateral and borrowed amounts
    uint256 public totalCollateral;
    uint256 public totalBorrowed;
    
    // Events
    event CollateralDeposited(address indexed user, uint256 amount);
    event MUSDBorrowed(address indexed user, uint256 amount);
    event MUSDRepaid(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    // Send functionality removed for focused vault
    event VaultLiquidated(address indexed user, uint256 collateralAmount, uint256 debtAmount);
    
    constructor(address _musdToken) Ownable(msg.sender) {
        musdToken = _musdToken;
    }
    
    /**
     * @dev Deposit BTC collateral to create or increase vault
     * @param amount Amount of BTC to deposit (in wei)
     */
    function depositCollateral(uint256 amount) external payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value == amount, "Incorrect ETH amount");
        
        Vault storage vault = vaults[msg.sender];
        
        // Update interest if vault exists
        if (vault.exists) {
            _updateInterest(msg.sender);
        }
        
        vault.collateralAmount += amount;
        vault.exists = true;
        vault.lastUpdateTime = block.timestamp;
        
        totalCollateral += amount;
        
        emit CollateralDeposited(msg.sender, amount);
    }
    
    /**
     * @dev Borrow MUSD against BTC collateral
     * @param amount Amount of MUSD to borrow (in wei)
     */
    function borrowMUSD(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        Vault storage vault = vaults[msg.sender];
        require(vault.exists, "Vault does not exist");
        
        _updateInterest(msg.sender);
        
        uint256 newBorrowedAmount = vault.borrowedAmount + amount;
        require(_isHealthyCollateralRatio(vault.collateralAmount, newBorrowedAmount), "Insufficient collateral");
        
        vault.borrowedAmount = newBorrowedAmount;
        totalBorrowed += amount;
        
        // Mint MUSD and send to user - ensure minting succeeds
        try IMUSDToken(musdToken).mint(msg.sender, amount) {
            // Mint successful
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Minting failed: ", reason)));
        } catch {
            revert("Minting failed: Unknown error");
        }
        
        emit MUSDBorrowed(msg.sender, amount);
    }
    
    /**
     * @dev Repay MUSD debt (partial or full repayment supported)
     * @param amount Amount of MUSD to repay (in wei)
     * @notice Partial repayment is allowed. If amount > debt, only the debt amount is repaid.
     *         If amount < debt, the exact amount specified is repaid and remaining debt continues to accrue interest.
     */
    function repayMUSD(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        Vault storage vault = vaults[msg.sender];
        require(vault.exists, "Vault does not exist");
        
        _updateInterest(msg.sender);
        
        uint256 actualRepayAmount = amount > vault.borrowedAmount ? vault.borrowedAmount : amount;
        
        vault.borrowedAmount -= actualRepayAmount;
        totalBorrowed -= actualRepayAmount;
        
        // First approve if needed, then burn the MUSD
        IERC20(musdToken).transferFrom(msg.sender, address(this), actualRepayAmount);
        IMUSDToken(musdToken).burn(address(this), actualRepayAmount);
        
        emit MUSDRepaid(msg.sender, actualRepayAmount);
    }
    
    /**
     * @dev Withdraw BTC collateral
     * @param amount Amount of BTC to withdraw (in wei)
     */
    function withdrawCollateral(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        Vault storage vault = vaults[msg.sender];
        require(vault.exists, "Vault does not exist");
        
        _updateInterest(msg.sender);
        
        // Verify sufficient collateral
        require(vault.collateralAmount >= amount, "Insufficient collateral");
        
        // If there is outstanding debt, only allow withdrawal that maintains collateral ratio
        if (vault.borrowedAmount > 0) {
            // After withdrawal, ensure health is maintained
            uint256 remainingCollateral = vault.collateralAmount - amount;
            require(_isHealthyCollateralRatio(remainingCollateral, vault.borrowedAmount), "Insufficient collateral ratio after withdrawal");
        }

        uint256 newCollateralAmount = vault.collateralAmount - amount;
        vault.collateralAmount = newCollateralAmount;
        totalCollateral -= amount;
        
        // Transfer BTC to user
        payable(msg.sender).transfer(amount);
        
        emit CollateralWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Compute maximum BTC withdrawable while staying above the minimum collateral ratio
     * @param user User address
     * @return Amount of BTC (in wei) that can be withdrawn right now
     */
    function getMaxWithdrawable(address user) external view returns (uint256) {
        Vault memory vault = vaults[user];
        if (!vault.exists || vault.collateralAmount == 0) {
            return 0;
        }

        // If no debt, full collateral is withdrawable
        if (vault.borrowedAmount == 0) {
            return vault.collateralAmount;
        }

        // Calculate the minimum collateral required to maintain MIN_COLLATERAL_RATIO after withdrawal
        // Condition: (remainingCollateral * BTC_PRICE_USD * 10000) / borrowedAmount >= MIN_COLLATERAL_RATIO
        // → remainingCollateral >= (MIN_COLLATERAL_RATIO * borrowedAmount) / (BTC_PRICE_USD * 10000)
        uint256 requiredCollateral = (MIN_COLLATERAL_RATIO * vault.borrowedAmount) / (BTC_PRICE_USD * 10000);

        if (vault.collateralAmount <= requiredCollateral) {
            return 0;
        }

        uint256 maxWithdraw = vault.collateralAmount - requiredCollateral;
        return maxWithdraw;
    }
    
    // sendCollateral removed
    
    /**
     * @dev Get user's collateral ratio
     * @param user User address
     * @return Collateral ratio in basis points (11000 = 110%)
     */
    function getCollateralRatio(address user) external view returns (uint256) {
        Vault memory vault = vaults[user];
        if (vault.borrowedAmount == 0) return 0;
        
        // Convert collateral to USD value (both in same units)
        // collateralAmount is in wei, BTC_PRICE_USD is in USD
        // collateralValue = collateralAmount * BTC_PRICE_USD (in wei*USD units)
        uint256 collateralValue = vault.collateralAmount * BTC_PRICE_USD;
        return (collateralValue * 10000) / vault.borrowedAmount;
    }
    
    /**
     * @dev Get user's health factor
     * @param user User address
     * @return Health factor (100 = 1.0)
     */
    function getHealthFactor(address user) external view returns (uint256) {
        uint256 collateralRatio = this.getCollateralRatio(user);
        if (collateralRatio == 0) return 0;
        return (collateralRatio * 100) / MIN_COLLATERAL_RATIO;
    }
    
    /**
     * @dev Get user's collateral balance
     * @param user User address
     * @return Collateral amount in wei
     */
    function getCollateralBalance(address user) external view returns (uint256) {
        return vaults[user].collateralAmount;
    }
    
    /**
     * @dev Get user's borrowed amount
     * @param user User address
     * @return Borrowed amount in wei
     */
    function getBorrowedAmount(address user) external view returns (uint256) {
        return vaults[user].borrowedAmount;
    }
    
    /**
     * @dev Get user's current debt including accrued interest (read-only)
     * @param user User address
     * @return Current debt in wei (borrowed + accrued interest since last update)
     */
    function getCurrentDebt(address user) external view returns (uint256) {
        Vault memory vault = vaults[user];
        if (!vault.exists || vault.borrowedAmount == 0) {
            return 0;
        }
        uint256 timeElapsed = block.timestamp - vault.lastUpdateTime;
        uint256 interest = (vault.borrowedAmount * INTEREST_RATE * timeElapsed) / (365 days * 10000);
        return vault.borrowedAmount + interest;
    }
    
    /**
     * @dev Get current interest rate
     * @return Interest rate in basis points
     */
    function getInterestRate() external pure returns (uint256) {
        return INTEREST_RATE;
    }
    
    /**
     * @dev Get liquidation price for user
     * @param user User address
     * @return Liquidation price in USD
     */
    function getLiquidationPrice(address user) external view returns (uint256) {
        Vault memory vault = vaults[user];
        if (vault.collateralAmount == 0) return 0;
        
        // Liquidation price = (borrowed amount * min ratio) / collateral amount
        return (vault.borrowedAmount * MIN_COLLATERAL_RATIO) / vault.collateralAmount;
    }
    
    /**
     * @dev Check if collateral ratio is healthy
     * @param collateralAmount Collateral amount
     * @param borrowedAmount Borrowed amount
     * @return True if healthy
     */
    function _isHealthyCollateralRatio(uint256 collateralAmount, uint256 borrowedAmount) internal view returns (bool) {
        if (borrowedAmount == 0) return true;
        
        // Convert collateral to USD value (both in same units: wei * USD)
        // collateralAmount is in wei (1 BTC = 1e18 wei)
        // BTC_PRICE_USD is in USD (50000 = $50,000)
        // collateralValue = collateralAmount (wei) * BTC_PRICE_USD (USD) = value in wei*USD units
        // borrowedAmount is in wei (MUSD uses 18 decimals)
        // To compare, we need: (collateralValue * 10000) / borrowedAmount >= MIN_COLLATERAL_RATIO
        // Simplified: (collateralAmount * BTC_PRICE_USD * 10000) / borrowedAmount >= 110
        uint256 collateralValue = collateralAmount * BTC_PRICE_USD;
        uint256 collateralRatio = (collateralValue * 10000) / borrowedAmount;
        
        return collateralRatio >= MIN_COLLATERAL_RATIO;
    }
    
    /**
     * @dev Update interest for a vault
     * @param user User address
     */
    function _updateInterest(address user) internal {
        Vault storage vault = vaults[user];
        if (vault.borrowedAmount == 0) return;
        
        uint256 timeElapsed = block.timestamp - vault.lastUpdateTime;
        uint256 interest = (vault.borrowedAmount * INTEREST_RATE * timeElapsed) / (365 days * 10000);
        
        vault.borrowedAmount += interest;
        vault.lastUpdateTime = block.timestamp;
    }
    
    /**
     * @dev Emergency function to withdraw contract balance (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH deposits
     */
    receive() external payable {
        // Allow direct ETH deposits
    }
}
