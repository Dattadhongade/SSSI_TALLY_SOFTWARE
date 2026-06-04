/**
 * Determines if a transaction is Intra-state (CGST/SGST) or Inter-state (IGST).
 * @param {string} companyState - State of the active company.
 * @param {string} partyState - State of the ledger/party.
 * @returns {boolean} true if it's the same state.
 */
export const isIntraState = (companyState, partyState) => {
  if (!companyState || !partyState) return true; // Default to local if missing
  return companyState.trim().toLowerCase() === partyState.trim().toLowerCase();
};

/**
 * Calculates GST components for a given taxable amount.
 * @param {number} taxableAmount - The total taxable amount of the item.
 * @param {number} gstRate - The total GST % (e.g. 18)
 * @param {boolean} intraState - True if CGST/SGST applies, false if IGST applies.
 * @returns {object} { cgstAmount, sgstAmount, igstAmount, totalTax }
 */
export const calculateGST = (taxableAmount, gstRate, intraState) => {
  const rate = Number(gstRate) || 0;
  const amount = Number(taxableAmount) || 0;
  
  if (rate === 0 || amount === 0) {
    return { cgstAmount: 0, sgstAmount: 0, igstAmount: 0, totalTax: 0 };
  }

  if (intraState) {
    const halfRate = rate / 2;
    const cgstAmount = (amount * halfRate) / 100;
    const sgstAmount = (amount * halfRate) / 100;
    return { 
      cgstAmount, 
      sgstAmount, 
      igstAmount: 0, 
      totalTax: cgstAmount + sgstAmount 
    };
  } else {
    const igstAmount = (amount * rate) / 100;
    return { 
      cgstAmount: 0, 
      sgstAmount: 0, 
      igstAmount, 
      totalTax: igstAmount 
    };
  }
};

/**
 * Generates accounting entries for a Sales Voucher.
 * Party A/c Dr.
 *    To Sales A/c
 *    To Output CGST
 *    To Output SGST
 *    To Output IGST
 */
export const generateSalesEntries = (partyId, salesLedgerId, totalTaxable, taxDetails) => {
  const { totalTax } = taxDetails;
  const grandTotal = totalTaxable + totalTax;

  const entries = [];
  
  // 1. Party (Dr) - Grand Total
  entries.push({
    ledgerId: partyId,
    debitAmount: grandTotal,
    creditAmount: 0
  });

  // 2. Sales (Cr) - Taxable Amount
  entries.push({
    ledgerId: salesLedgerId,
    debitAmount: 0,
    creditAmount: totalTaxable
  });

  // 3. Tax Ledgers (Cr) - (In a real app, these ledger IDs would be dynamic or fetched from state)
  // For simplicity here, we assume standard IDs or we just return the amounts to be mapped to the right ledger
  return entries; 
};

/**
 * Generates accounting entries for a Purchase Voucher.
 * Purchase A/c Dr.
 * Input CGST Dr.
 * Input SGST Dr.
 * Input IGST Dr.
 *    To Supplier A/c
 */
export const generatePurchaseEntries = (supplierId, purchaseLedgerId, totalTaxable, taxDetails) => {
  const { totalTax } = taxDetails;
  const grandTotal = totalTaxable + totalTax;

  const entries = [];
  
  // 1. Purchase (Dr) - Taxable Amount
  entries.push({
    ledgerId: purchaseLedgerId,
    debitAmount: totalTaxable,
    creditAmount: 0
  });

  // 2. Supplier (Cr) - Grand Total
  entries.push({
    ledgerId: supplierId,
    debitAmount: 0,
    creditAmount: grandTotal
  });

  return entries;
};
