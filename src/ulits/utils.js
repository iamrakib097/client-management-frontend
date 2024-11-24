export const parseCurrency = (amount) => {
  // Ensure amount is a string
  if (typeof amount !== "string") {
    amount = String(amount); // Convert the amount to a string if it's not already
  }

  // Now safely call match
  const match = amount.match(/[\d,]+(\.\d{1,2})?/);
  const formatted = match ? match[0] : "Invalid amount";
  const value = match ? parseFloat(formatted.replace(/,/g, "")) : 0;

  return {
    formatted,
    value,
  };
};

export const extractCurrencyAndAmount = (budgetString) => {
  const regex = /(\d+(\.\d{1,2})?)\s*([A-Za-z]+)/;
  const matches = budgetString.match(regex);

  if (matches) {
    const amount = parseFloat(matches[1]);
    const currency = matches[3] || "USD";
    return { currency, amount };
  }

  return { currency: "USD", amount: 0 };
};
