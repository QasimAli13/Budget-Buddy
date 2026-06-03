function handleFormSubmit(event) {
    event.preventDefault();

    const titleEl = document.getElementById('title');
    const amountEl = document.getElementById('amount');
    const dateEl = document.getElementById('date');
    const categoryEl = document.getElementById('category');
    const typeElement = document.querySelector('input[name="type"]:checked');

    if (!titleEl || !amountEl || !dateEl || !categoryEl || !typeElement) {
        alert("Missing form elements!");
        return;
    }

    const title = titleEl.value;
    const type = typeElement.value; // "expense" or "income"
    const amount = parseFloat(amountEl.value);
    const date = dateEl.value;
    const category = categoryEl.value;

    if (!title || !type || isNaN(amount) || amount <= 0 || !date || !category) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const newTransaction = {
        id: Date.now(),
        title: title,
        type: type, 
        amount: amount,
        date: date,
        category: category
    };

    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    alert('Transaction added successfully!');

    titleEl.value = '';
    amountEl.value = '';
    categoryEl.selectedIndex = 0;
}

function handlecancelbutton() {
    window.location.href = 'index.html';
}

function renderHome() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const recentList = document.querySelector(".transactions-list");

    if (recentList) {
        recentList.innerHTML = "";
    }

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.slice().reverse().forEach((transaction, index) => {
        const amount = parseFloat(transaction.amount) || 0;
        
        if (transaction.type === "income") {
            totalIncome += amount;
        } else if (transaction.type === "expense") {
            totalExpense += amount;
        }

        // Render only the top 3 newest entries in the Recent Transactions card
        if (recentList && index < 3) {
            recentList.innerHTML += `
                <li>
                    <span>${transaction.title} (${transaction.category})</span>
                    <span style="color: ${transaction.type === 'income' ? '#4CAF50' : '#f44336'}; font-weight: 600;">
                        ${transaction.type === 'income' ? '+' : '-'}$${amount.toFixed(2)}
                    </span>
                </li>
            `;
        }
    });

    const netSavings = totalIncome - totalExpense;

    // Overwrite the hardcoded HTML placeholders with live math numbers
    if (document.getElementById("total-income")) {
        document.getElementById("total-income").textContent = `Total Income: $${totalIncome.toFixed(2)}`;
    }
    if (document.getElementById("total-expenses")) {
        document.getElementById("total-expenses").textContent = `Total Expenses: $${totalExpense.toFixed(2)}`;
    }
    if (document.getElementById("net-savings")) {
        document.getElementById("net-savings").textContent = `Net Savings: $${netSavings.toFixed(2)}`;
    }
}

function renderSummary() {
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const categorytotal = {};
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (transaction.type === "expense") {
            const amount = parseFloat(transaction.amount) || 0;
            totalExpense += amount;

            if (!categorytotal[transaction.category]) {
                categorytotal[transaction.category] = 0;
            }
            categorytotal[transaction.category] += amount;
        }
    });

    drawPieChart(categorytotal, totalExpense);
    renderCategoryBars(categorytotal, totalExpense);
}

function drawPieChart(categoryTotals, totalExpenses) {
    const canvas = document.getElementById('expense-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (totalExpenses === 0) {
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#888";
        ctx.textAlign = "center";
        ctx.fillText("No expense data available", canvas.width / 2, canvas.height / 2);
        return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCC'];
    let colorIndex = 0;
    let startAngle = 0;

    for (const category in categoryTotals) {
        const amount = categoryTotals[category];
        const slicePercentage = amount / totalExpenses;
        const sliceAngle = slicePercentage * (2 * Math.PI);
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        ctx.fillStyle = colors[colorIndex % colors.length];
        ctx.fill();

        colorIndex++;
        startAngle = endAngle;
    }
}

function renderCategoryBars(categoryTotals, totalExpenses) {
    const container = document.getElementById('categoryBars');
    if (!container) return;

    if (totalExpenses === 0) {
        container.innerHTML = '<p class="no-data">No expense breakdown available.</p>';
        return;
    }
    const savedBudgets = JSON.parse(localStorage.getItem('budgets')) || {};

    container.innerHTML = Object.keys(categoryTotals).map(category => {
        const amount = categoryTotals[category];
        const percentage = ((amount / totalExpenses) * 100).toFixed(0);

        const budgetLimit = parseFloat(savedBudgets[category]) || 0;
        let statusEmoji = '';

        if (budgetLimit > 0) {
            statusEmoji = amount > budgetLimit ? ' ❌' : ' ✅';
        }

        return `
            <div class="category-bar-row" style="margin-bottom: 15px;">
                <div class="category-info" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span class="category-name" style="font-weight: 500;">${category}${statusEmoji}</span>
                    <span class="category-amount" style="color: #666;">$${amount.toFixed(2)} (${percentage}%)</span>
                </div>
                <div class="progress-bar-background" style="background: #e0e0e0; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div class="progress-bar-fill" style="width: ${percentage}%; background: #10b981; height: 100%; border-radius: 5px; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
    }).join('');
}

function saveAllBudgets() {
    const budgets = {
        Food: parseFloat(document.getElementById('food-budget').value) || 0,
        Transport: parseFloat(document.getElementById('transport-budget').value) || 0,
        Entertainment: parseFloat(document.getElementById('entertainment-budget').value) || 0,
        Bills: parseFloat(document.getElementById('bills-budget').value) || 0,
        Other: parseFloat(document.getElementById('other-budget').value) || 0
    };
    localStorage.setItem('budgets', JSON.stringify(budgets));
    alert('All budgets saved successfully!');
}

function loadBudgets() {
    const savedBudgets = JSON.parse(localStorage.getItem('budgets'));
    if (!savedBudgets) return;

    if (document.getElementById('food-budget')) {
        document.getElementById('food-budget').value = savedBudgets.Food || '';
        document.getElementById('transport-budget').value = savedBudgets.Transport || '';
        document.getElementById('entertainment-budget').value = savedBudgets.Entertainment || '';
        document.getElementById('bills-budget').value = savedBudgets.Bills || '';
        document.getElementById('other-budget').value = savedBudgets.Other || '';
    }
}

function resetBudgets() {
    if (confirm('Are you sure you want to reset your budget? This will clear all your budget data.')) {
        localStorage.removeItem('budgets');

        if (document.getElementById('food-budget')) {
            document.getElementById('food-budget').value = '';
            document.getElementById('transport-budget').value = '';
            document.getElementById('entertainment-budget').value = '';
            document.getElementById('bills-budget').value = '';
            document.getElementById('other-budget').value = '';
        }
        alert('Budget has been reset.');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('total-income')) {
        renderHome();
    }
    if (document.getElementById('categoryBars')) {
        renderSummary();
    }

    if (document.getElementById('food-budget')) {
        loadBudgets();
    }
});