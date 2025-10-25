// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract InvoiceContract {
    struct Invoice {
        uint256 id;
        address payable recipient;
        uint256 amount;
        string description;
        bool paid;
        uint256 createdAt;
    }
    
    mapping(uint256 => Invoice) public invoices;
    uint256 public invoiceCount;
    
    event InvoiceCreated(uint256 indexed id, address indexed recipient, uint256 amount);
    event InvoicePaid(uint256 indexed id, uint256 amount);
    
    function createInvoice(
        address payable _recipient,
        uint256 _amount,
        string memory _description
    ) public returns (uint256) {
        invoiceCount++;
        invoices[invoiceCount] = Invoice({
            id: invoiceCount,
            recipient: _recipient,
            amount: _amount,
            description: _description,
            paid: false,
            createdAt: block.timestamp
        });
        
        emit InvoiceCreated(invoiceCount, _recipient, _amount);
        return invoiceCount;
    }
    
    function payInvoice(uint256 _id) public payable {
        require(_id > 0 && _id <= invoiceCount, "Invalid invoice ID");
        require(!invoices[_id].paid, "Invoice already paid");
        require(msg.value >= invoices[_id].amount, "Insufficient payment");
        
        invoices[_id].paid = true;
        invoices[_id].recipient.transfer(invoices[_id].amount);
        
        emit InvoicePaid(_id, invoices[_id].amount);
    }
    
    function getInvoice(uint256 _id) public view returns (Invoice memory) {
        require(_id > 0 && _id <= invoiceCount, "Invalid invoice ID");
        return invoices[_id];
    }
}
