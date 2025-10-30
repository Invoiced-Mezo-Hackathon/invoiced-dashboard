import { expect } from "chai";
import { ethers } from "hardhat";

describe("InvoiceContract", function () {
  let invoiceContract: unknown;
  let recipient: unknown;

  beforeEach(async function () {
    const [, recipientSigner] = await ethers.getSigners();
    recipient = recipientSigner;
    
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
    void expect(receipt).to.not.be.null;
    
    const invoice = await (invoiceContract as { getInvoice: (id: number) => Promise<unknown> }).getInvoice(1);
    void expect((invoice as { recipient: string }).recipient).to.equal((recipient as { address: string }).address);
    void expect((invoice as { amount: bigint }).amount).to.equal(amount);
    void expect((invoice as { description: string }).description).to.equal(description);
    void expect((invoice as { paid: boolean }).paid).to.be.false;
  });

  it("Should pay an invoice", async function () {
    const amount = ethers.parseEther("1.0");
    const description = "Test invoice";
    
    // Create invoice
    await (invoiceContract as { createInvoice: (recipient: string, amount: bigint, description: string) => Promise<unknown> }).createInvoice(
      (recipient as { address: string }).address,
      amount,
      description
    );
    
    // Pay invoice
    const tx = await (invoiceContract as { payInvoice: (id: number, options: { value: bigint }) => Promise<unknown> }).payInvoice(1, { value: amount });
    const receipt = await tx.wait();
    void expect(receipt).to.not.be.null;
    
    const invoice = await (invoiceContract as { getInvoice: (id: number) => Promise<unknown> }).getInvoice(1);
    void expect((invoice as { paid: boolean }).paid).to.be.true;
  });
});
