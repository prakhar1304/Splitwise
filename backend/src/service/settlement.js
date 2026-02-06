/**
 * Settlement optimization: minimize number of transactions to settle all debts.
 * Input: balances array of { userId (or id), name, balance } where balance > 0 means they are owed.
 * Output: array of { fromId, fromName, toId, toName, amount, statement }.
 */
function optimizeSettlements(balances, options = {}) {
  const { idKey = "userId", nameKey = "name", balanceKey = "balance" } = options;
  const creditors = [];
  const debtors = [];

  for (const entry of balances) {
    const id = entry[idKey];
    const name = entry[nameKey] ?? id?.toString?.() ?? "Unknown";
    const bal = Number(entry[balanceKey]) || 0;
    if (bal > 0.01) {
      creditors.push({ id, name, amount: bal });
    } else if (bal < -0.01) {
      debtors.push({ id, name, amount: Math.abs(bal) });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    const from = debtors[i];
    const to = creditors[j];
    settlements.push({
      fromId: from.id,
      fromName: from.name,
      toId: to.id,
      toName: to.name,
      amount: parseFloat(amount.toFixed(2)),
      statement: `${from.name} pays ${to.name} ₹${amount.toFixed(2)}`,
    });
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return settlements;
}

/**
 * Build balance map (userId -> net balance) from expenses.
 * Each expense: payer gets +amount, each person in splitDetails gets -their share.
 * expenses: array of { paidByUser, amount, splitDetails: [{ userId, amount }] }.
 */
function computeBalancesFromExpenses(expenses) {
  const map = new Map(); // userId -> balance (positive = owed to them)

  for (const exp of expenses) {
    const payerId = exp.paidByUser?.toString?.() ?? exp.paidByUser;
    const amount = Number(exp.amount) || 0;
    if (payerId) {
      map.set(payerId, (map.get(payerId) || 0) + amount);
    }
    const details = exp.splitDetails || [];
    for (const d of details) {
      const uid = d.userId?.toString?.() ?? d.userId;
      const share = Number(d.amount) || 0;
      if (uid) {
        map.set(uid, (map.get(uid) || 0) - share);
      }
    }
  }

  return map;
}

export { optimizeSettlements, computeBalancesFromExpenses };
