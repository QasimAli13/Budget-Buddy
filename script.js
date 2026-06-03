function renderhome() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "income") {
            totalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
            totalExpense += transaction.amount;
        }
    });

    // FIXED VARIABLE NAME
    const netSavings = totalIncome - totalExpense;

    // Update UI
    document.getElementById("total-income").textContent =
        `Total Income: $${totalIncome.toFixed(2)}`;

    document.getElementById("total-expense").textContent =
        `Total Expense: $${totalExpense.toFixed(2)}`;

    const netSavingsElement = document.getElementById("net-savings");

    netSavingsElement.textContent =
        `Net Savings: $${netSavings.toFixed(2)}`;

    // Color logic
    if (netSavings < 0) {
        netSavingsElement.style.color = "red";
    } else if (netSavings > 0) {
        netSavingsElement.style.color = "green";
    } else {
        netSavingsElement.style.color = "gray";
    }
}

window.onload = renderhome;