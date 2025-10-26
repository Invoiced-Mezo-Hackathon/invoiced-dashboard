// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract InvoiceContract {
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
    }
    
    mapping(uint256 => Invoice) public invoices;
    mapping(address => uint256[]) public userInvoices;  // Track invoices by creator
    uint256 public invoiceCount;
    
    event InvoiceCreated(
        uint256 indexed id, 
        address indexed creator, 
        address indexed recipient, 
        uint256 amount,
        string bitcoinAddress,
        string clientName
    );
    event InvoicePaid(uint256 indexed id, uint256 amount, uint256 timestamp);
    event InvoiceCancelled(uint256 indexed id, uint256 timestamp);
    
    function createInvoice(
        address payable _recipient,
        uint256 _amount,
        string memory _description,
        string memory _bitcoinAddress,
        string memory _clientName,
        string memory _clientCode
    ) public returns (uint256) {
        invoiceCount++;
        invoices[invoiceCount] = Invoice({
            id: invoiceCount,
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
            paidAt: 0
        });
        
        // Track invoice for creator
        userInvoices[msg.sender].push(invoiceCount);
        
        emit InvoiceCreated(
            invoiceCount, 
            msg.sender, 
            _recipient, 
            _amount,
            _bitcoinAddress,
            _clientName
        );
        return invoiceCount;
    }
    
    function confirmPayment(uint256 _id) public {
        require(_id > 0 && _id <= invoiceCount, "Invalid invoice ID");
        require(invoices[_id].creator == msg.sender, "Only invoice creator can confirm payment");
        require(!invoices[_id].paid, "Invoice already paid");
        require(!invoices[_id].cancelled, "Invoice is cancelled");
        
        invoices[_id].paid = true;
        invoices[_id].paidAt = block.timestamp;
        
        emit InvoicePaid(_id, invoices[_id].amount, block.timestamp);
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
}
