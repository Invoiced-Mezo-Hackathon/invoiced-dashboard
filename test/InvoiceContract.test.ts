import { expect } from "chai";
import { ethers } from "hardhat";

describe("InvoiceContract", function () {
  let invoiceContract: any;
  let owner: any;
  let recipient: any;

  beforeEach(async function () {
    [owner, recipient] = await ethers.getSigners();
    
    const InvoiceContract = await ethers.getContractFactory("InvoiceContract");
    invoiceContract = await InvoiceContract.deploy();
    await invoiceContract.waitForDeployment();
  });

  it("Should create an invoice", async function () {
    const amount = ethers.parseEther("1.0");
    const description = "Test invoice";
    
    const tx = await invoiceContract.createInvoice(
      recipient.address,
      amount,
      description
    );
    
    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;
    
    const invoice = await invoiceContract.getInvoice(1);
    expect(invoice.recipient).to.equal(recipient.address);
    expect(invoice.amount).to.equal(amount);
    expect(invoice.description).to.equal(description);
    expect(invoice.paid).to.be.false;
  });

  it("Should pay an invoice", async function () {
    const amount = ethers.parseEther("1.0");
    const description = "Test invoice";
    
    // Create invoice
    await invoiceContract.createInvoice(
      recipient.address,
      amount,
      description
    );
    
    // Pay invoice
    const tx = await invoiceContract.payInvoice(1, { value: amount });
    const receipt = await tx.wait();
    expect(receipt).to.not.be.null;
    
    const invoice = await invoiceContract.getInvoice(1);
    expect(invoice.paid).to.be.true;
  });
});
