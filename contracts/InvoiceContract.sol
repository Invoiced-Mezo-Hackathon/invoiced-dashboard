// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract InvoiceContract is AccessControl {
    struct Invoice {
        uint256 id;
        address payable creator;        // Who created the invoice
        address payable recipient;      // Who should pay (can be same as creator)
        uint256 amount;                // Amount in wei (will be converted to USD/KES in frontend)
        string description;           // Invoice details
        string bitcoinAddress;        // Bitcoin address for payment
        string clientName;            // Client name
        string clientCode;            // Auto-generated client code
        bool paid;                    // Payment status
        bool cancelled;              // Cancellation status
        uint256 createdAt;           // Creation timestamp
        uint256 paidAt;              // Payment confirmation timestamp
        uint256 expiresAt;           // Invoice expiry timestamp (1 hour from creation)
        string payToAddress;         // Actual payment destination address (used by BOAR)
        string paymentTxHash;         // Bitcoin transaction hash when payment confirmed
        string observedInboundAmount; // Actual amount received (may differ from requested)
        string currency;              // Invoice currency (USD/KES/BTC)
        string balanceAtCreation;     // Balance snapshot for payment verification
    }
    
    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) public userInvoices;  // Track invoices by creator
    uint256 public invoiceCount;
    bytes32 public constant BOARD_ROLE = keccak256("BOARD_ROLE");
    bytes32 public constant PAYMENT_ORACLE_ROLE = keccak256("PAYMENT_ORACLE_ROLE");
    
    event InvoiceCreated(
        uint256 indexed id, 
        address indexed creator, 
        address indexed recipient, 
        uint256 amount,
        string bitcoinAddress,
        string clientName,
        string payToAddress,
        string currency,
        uint256 expiresAt
    );
    event InvoicePaid(uint256 indexed id, uint256 amount, uint256 timestamp, string paymentTxHash, string observedInboundAmount);
    event InvoiceCancelled(uint256 indexed id, uint256 timestamp);
    event InvoiceApproved(uint256 indexed id, address indexed approver, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BOARD_ROLE, msg.sender);
    }
    
    function createInvoice(
        address payable _recipient,
        uint256 _amount,
        string memory _description,
        string memory _bitcoinAddress,
        string memory _clientName,
        string memory _clientCode,
        uint256 _expiresAt,
        string memory _payToAddress,
        string memory _currency,
        string memory _balanceAtCreation
    ) public returns (uint256) {
        invoiceCount++;
        uint256 newInvoiceId = invoiceCount;
        
        invoices[newInvoiceId] = Invoice({
            id: newInvoiceId,
            creator: payable(msg.sender),
            recipient: _recipient,
            amount: _amount,
            description: _description,
            bitcoinAddress: _bitcoinAddress,
            clientName: _clientName,
            clientCode: _clientCode,
            paid: false,
            cancelled: false,
            createdAt: block.timestamp,
            paidAt: 0,
            expiresAt: _expiresAt,
            payToAddress: _payToAddress,
            paymentTxHash: "",
            observedInboundAmount: "",
            currency: _currency,
            balanceAtCreation: _balanceAtCreation
        });
        
        // Track invoice for creator
        userInvoices[msg.sender].push(newInvoiceId);
        
        emit InvoiceCreated(
            newInvoiceId, 
            msg.sender, 
            _recipient, 
            _amount,
            _bitcoinAddress,
            _clientName,
            _payToAddress,
            _currency,
            _expiresAt
        );
        return newInvoiceId;
    }
    
    /**
     * @notice Confirm payment for an invoice after Boar Network detects BTC receipt
     * @param _id Invoice ID
     * @param _paymentTxHash Transaction hash from Boar Network detection
     * @param _observedInboundAmount Actual amount received (in wei, may exceed requested amount - overpayments accepted)
     * @dev Validates expiry, payment status, and authorization. Stores observed amount to handle overpayments.
     *      Frontend validates that observedAmount >= requested amount before calling this function.
     */
    function confirmPayment(uint256 _id, string memory _paymentTxHash, string memory _observedInboundAmount) public {
        require(_id > 0 && _id <= invoiceCount, "Invalid invoice ID");
        require(!invoices[_id].paid, "Invoice already paid");
        require(!invoices[_id].cancelled, "Invoice is cancelled");
        require(block.timestamp <= invoices[_id].expiresAt, "Invoice expired");

        // Allow invoice creator or authorized oracle to confirm payment
        // Oracle can auto-confirm when Boar detects payment >= requested amount
        require(
            invoices[_id].creator == msg.sender || hasRole(PAYMENT_ORACLE_ROLE, msg.sender),
            "Not authorized to confirm"
        );
        
        invoices[_id].paid = true;
        invoices[_id].paidAt = block.timestamp;
        invoices[_id].paymentTxHash = _paymentTxHash;
        invoices[_id].observedInboundAmount = _observedInboundAmount; // Can be > amount (overpayment accepted)
        
        emit InvoicePaid(_id, invoices[_id].amount, block.timestamp, _paymentTxHash, _observedInboundAmount);
    }
    
    function cancelInvoice(uint256 _id) public {
        require(_id > 0 && _id <= invoiceCount, "Invalid invoice ID");
        require(invoices[_id].creator == msg.sender, "Only invoice creator can cancel invoice");
        require(!invoices[_id].paid, "Cannot cancel paid invoice");
        require(!invoices[_id].cancelled, "Invoice already cancelled");
        
        invoices[_id].cancelled = true;
        
        emit InvoiceCancelled(_id, block.timestamp);
    }
    
    function getInvoice(uint256 _id) public view returns (Invoice memory) {
        require(_id > 0 && _id <= invoiceCount, "Invalid invoice ID");
        return invoices[_id];
    }
    
    function getUserInvoices(address _user) public view returns (uint256[] memory) {
        return userInvoices[_user];
    }
    
    function getUserInvoiceCount(address _user) public view returns (uint256) {
        return userInvoices[_user].length;
    }
    
    function getPaidInvoices(address _user) public view returns (uint256[] memory) {
        uint256[] memory userInvoiceIds = userInvoices[_user];
        uint256 paidCount = 0;
        
        // Count paid invoices
        for (uint256 i = 0; i < userInvoiceIds.length; i++) {
            if (invoices[userInvoiceIds[i]].paid) {
                paidCount++;
            }
        }
        
        // Create array of paid invoice IDs
        uint256[] memory paidInvoices = new uint256[](paidCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userInvoiceIds.length; i++) {
            if (invoices[userInvoiceIds[i]].paid) {
                paidInvoices[index] = userInvoiceIds[i];
                index++;
            }
        }
        
        return paidInvoices;
    }
    
    function getPendingInvoices(address _user) public view returns (uint256[] memory) {
        uint256[] memory userInvoiceIds = userInvoices[_user];
        uint256 pendingCount = 0;
        
        // Count pending invoices
        for (uint256 i = 0; i < userInvoiceIds.length; i++) {
            if (!invoices[userInvoiceIds[i]].paid && !invoices[userInvoiceIds[i]].cancelled) {
                pendingCount++;
            }
        }
        
        // Create array of pending invoice IDs
        uint256[] memory pendingInvoices = new uint256[](pendingCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userInvoiceIds.length; i++) {
            if (!invoices[userInvoiceIds[i]].paid && !invoices[userInvoiceIds[i]].cancelled) {
                pendingInvoices[index] = userInvoiceIds[i];
                index++;
            }
        }
        
        return pendingInvoices;
    }
    
    function getTotalRevenue(address _user) public view returns (uint256) {
        uint256[] memory userInvoiceIds = userInvoices[_user];
        uint256 total = 0;
        
        for (uint256 i = 0; i < userInvoiceIds.length; i++) {
            if (invoices[userInvoiceIds[i]].paid) {
                total += invoices[userInvoiceIds[i]].amount;
            }
        }
        
        return total;
    }
    
    function getPendingAmount(address _user) public view returns (uint256) {
        uint256[] memory userInvoiceIds = userInvoices[_user];
        uint256 total = 0;
        
        for (uint256 i = 0; i < userInvoiceIds.length; i++) {
            if (!invoices[userInvoiceIds[i]].paid && !invoices[userInvoiceIds[i]].cancelled) {
                total += invoices[userInvoiceIds[i]].amount;
            }
        }
        
        return total;
    }
    
    // Get all invoices globally (for shared visibility)
    function getAllInvoices() public view returns (Invoice[] memory) {
        Invoice[] memory allInvoices = new Invoice[](invoiceCount);
        
        for (uint256 i = 1; i <= invoiceCount; i++) {
            allInvoices[i - 1] = invoices[i];
        }
        
        return allInvoices;
    }
    
    // Get all invoice IDs by status
    function getInvoicesByStatus(bool includePaid, bool includeCancelled) public view returns (uint256[] memory) {
        uint256[] memory tempArray = new uint256[](invoiceCount);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= invoiceCount; i++) {
            bool isPaid = invoices[i].paid;
            bool isCancelled = invoices[i].cancelled;
            
            if (isPaid && includePaid) {
                tempArray[count] = i;
                count++;
            } else if (isCancelled && includeCancelled) {
                tempArray[count] = i;
                count++;
            } else if (!isPaid && !isCancelled) {
                tempArray[count] = i;
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempArray[i];
        }
        
        return result;
    }

    function approveInvoice(uint256 _id) public onlyRole(BOARD_ROLE) {
        require(_id > 0 && _id <= invoiceCount, "Invalid invoice ID");
        require(invoices[_id].paid, "Invoice not paid");
        emit InvoiceApproved(_id, msg.sender, block.timestamp);
    }
}
