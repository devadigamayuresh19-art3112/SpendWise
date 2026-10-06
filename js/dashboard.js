
/* =========================================================
   SPENDWISE — DASHBOARD
   Enhanced version
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       AUTH
       ===================================================== */

    const currentUser = JSON.parse(
        localStorage.getItem("spendwiseCurrentUser")
    );

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const balanceAmount = document.getElementById("balanceAmount");
    const incomeAmount = document.getElementById("incomeAmount");
    const expenseAmount = document.getElementById("expenseAmount");
    const transactionCount = document.getElementById("transactionCount");

    const transactionList =
        document.getElementById("transactionList");

    const emptyState =
        document.getElementById("emptyState");

    const categoryList =
        document.getElementById("categoryList");

    const emptyCategory =
        document.getElementById("emptyCategory");

    const transactionSearch =
        document.getElementById("transactionSearch");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const chartBars =
        document.getElementById("chartBars");

    const chartPeriod =
        document.getElementById("chartPeriod");

    const modal =
        document.getElementById("transactionModal");

    const transactionForm =
        document.getElementById("transactionForm");

    const balanceStatus =
        document.getElementById("balanceStatus");

    /* =====================================================
       USER UI
       ===================================================== */

    const firstName =
        (currentUser.name || "User")
            .trim()
            .split(/\s+/)[0];

    document.getElementById("greeting").textContent =
        `${getGreeting()}, ${firstName} 👋`;

    document.getElementById("sidebarUserName").textContent =
        currentUser.name || "User";

    document.getElementById("sidebarUserEmail").textContent =
        currentUser.email || "";

    document.getElementById("userAvatar").textContent =
        (currentUser.name || "U")
            .charAt(0)
            .toUpperCase();

    /* =====================================================
       TRANSACTIONS
       ===================================================== */

    let transactions = getTransactions();

    let editingTransactionId = null;

    function getStorageKey() {
        return `spendwiseTransactions_${currentUser.email}`;
    }

    function getTransactions() {
        try {
            return JSON.parse(
                localStorage.getItem(getStorageKey())
            ) || [];
        } catch {
            return [];
        }
    }

    function saveTransactions() {
        localStorage.setItem(
            getStorageKey(),
            JSON.stringify(transactions)
        );
    }

    /* =====================================================
       CURRENCY
       ===================================================== */

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(Number(amount) || 0);
    }

    /* =====================================================
       DATE
       ===================================================== */

    function formatDate(dateString) {
        if (!dateString) return "Unknown date";

        const date =
            new Date(`${dateString}T00:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "Unknown date";
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function getGreeting() {
        const hour = new Date().getHours();

        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";

        return "Good evening";
    }

    /* =====================================================
       CATEGORY ICONS
       ===================================================== */

    function getCategoryIcon(category) {

        const icons = {
            Food: "🍔",
            Travel: "🚌",
            Education: "📚",
            Shopping: "🛍️",
            Entertainment: "🎮",
            Other: "•"
        };

        return icons[category] || "•";
    }

    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    /* =====================================================
       TOAST SYSTEM
       ===================================================== */

    function showToast(message, type = "success") {

        let container =
            document.getElementById("toastContainer");

        if (!container) {

            container =
                document.createElement("div");

            container.id = "toastContainer";

            document.body.appendChild(container);
        }

        const toast =
            document.createElement("div");

        toast.className =
            `toast ${type === "error" ? "toast-error" : ""}`;

        toast.innerHTML = `
            <div class="toast-icon">
                ${type === "error" ? "!" : "✓"}
            </div>

            <div class="toast-message">
                ${escapeHtml(message)}
            </div>
        `;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        setTimeout(() => {

            toast.classList.remove("show");

            setTimeout(() => {
                toast.remove();
            }, 300);

        }, 2800);
    }

    /* =====================================================
       DASHBOARD CALCULATIONS
       ===================================================== */

    function updateDashboard() {

        let income = 0;
        let expenses = 0;

        transactions.forEach(transaction => {

            const amount =
                Number(transaction.amount) || 0;

            if (transaction.type === "income") {
                income += amount;
            } else {
                expenses += amount;
            }
        });

        const balance = income - expenses;

        balanceAmount.textContent =
            formatCurrency(balance);

        incomeAmount.textContent =
            formatCurrency(income);

        expenseAmount.textContent =
            formatCurrency(expenses);

        transactionCount.textContent =
            transactions.length;

        updateBalanceStatus(
            balance,
            income,
            expenses
        );

        renderTransactions();
        renderCategories();
        renderChart();
        updateExtraStats(
            income,
            expenses,
            balance
        );
    }

    /* =====================================================
       BALANCE STATUS
       ===================================================== */

    function updateBalanceStatus(
        balance,
        income,
        expenses
    ) {

        if (balance < 0) {

            balanceStatus.textContent =
                "⚠ Spending is higher than income";

            balanceStatus.classList.add(
                "balance-warning"
            );

        } else if (balance === 0 && income === 0) {

            balanceStatus.textContent =
                "Add your first transaction";

            balanceStatus.classList.remove(
                "balance-warning"
            );

        } else if (income > 0) {

            const savingsRate =
                Math.round(
                    ((income - expenses) / income) * 100
                );

            balanceStatus.textContent =
                `${Math.max(0, savingsRate)}% of income remaining`;

            balanceStatus.classList.remove(
                "balance-warning"
            );

        } else {

            balanceStatus.textContent =
                "Available balance";

            balanceStatus.classList.remove(
                "balance-warning"
            );
        }
    }

    /* =====================================================
       EXTRA DASHBOARD STATS
       ===================================================== */

    function updateExtraStats(
        income,
        expenses,
        balance
    ) {

        const topbar =
            document.querySelector(".topbar");

        if (!topbar) return;

        let insight =
            document.getElementById("dashboardInsight");

        if (!insight) {

            insight =
                document.createElement("div");

            insight.id =
                "dashboardInsight";

            insight.className =
                "dashboard-insight";

            topbar.appendChild(insight);
        }

        if (transactions.length === 0) {

            insight.innerHTML =
                "Start adding transactions to understand your spending.";

            return;
        }

        if (expenses === 0 && income > 0) {

            insight.innerHTML =
                "🎉 No expenses recorded yet. Nice start!";

            return;
        }

        if (balance < 0) {

            insight.innerHTML =
                "⚠ Your expenses are currently higher than your income.";

            return;
        }

        if (income > 0) {

            const rate =
                Math.round(
                    (balance / income) * 100
                );

            insight.innerHTML =
                `💡 You're currently keeping <strong>${Math.max(0, rate)}%</strong> of your income.`;
        }
    }

    /* =====================================================
       TRANSACTION RENDER
       ===================================================== */

    function renderTransactions() {

        const search =
            transactionSearch.value
                .trim()
                .toLowerCase();

        const selectedCategory =
            categoryFilter.value;

        const sortMode =
            document.getElementById("transactionSort")?.value
            || "newest";

        let filtered =
            transactions.filter(transaction => {

                const searchableText = [
                    transaction.title,
                    transaction.category,
                    transaction.type,
                    transaction.date
                ]
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    searchableText.includes(search);

                const matchesCategory =
                    selectedCategory === "all" ||
                    transaction.category === selectedCategory;

                return (
                    matchesSearch &&
                    matchesCategory
                );
            });

        filtered.sort((a, b) => {

            if (sortMode === "oldest") {
                return (
                    new Date(a.date) -
                    new Date(b.date)
                );
            }

            if (sortMode === "highest") {
                return (
                    Number(b.amount) -
                    Number(a.amount)
                );
            }

            if (sortMode === "lowest") {
                return (
                    Number(a.amount) -
                    Number(b.amount)
                );
            }

            return (
                new Date(b.date) -
                new Date(a.date)
            );
        });

        transactionList.innerHTML = "";

        if (filtered.length === 0) {

            emptyState.style.display = "flex";

            if (transactions.length > 0) {

                emptyState.querySelector("h3")
                    .textContent =
                    "No matching transactions";

                emptyState.querySelector("p")
                    .textContent =
                    "Try changing your search or category filter.";

                emptyState.querySelector(
                    ".empty-add-btn"
                ).style.display = "none";

            } else {

                emptyState.querySelector("h3")
                    .textContent =
                    "No transactions yet";

                emptyState.querySelector("p")
                    .textContent =
                    "Add your first transaction to start tracking your money.";

                emptyState.querySelector(
                    ".empty-add-btn"
                ).style.display =
                    "inline-flex";
            }

            return;
        }

        emptyState.style.display = "none";

        filtered.forEach(transaction => {

            const row =
                document.createElement("div");

            row.className =
                "transaction-row";

            const isIncome =
                transaction.type === "income";

            const sign =
                isIncome ? "+" : "-";

            const amountClass =
                isIncome ? "income" : "expense";

            row.innerHTML = `

                <div class="transaction-main">

                    <div class="transaction-category-icon">
                        ${getCategoryIcon(transaction.category)}
                    </div>

                    <div class="transaction-info">

                        <div class="transaction-title">
                            ${escapeHtml(transaction.title)}
                        </div>

                        <div class="transaction-meta">

                            <span>
                                ${escapeHtml(transaction.category)}
                            </span>

                            <span class="transaction-meta-dot"></span>

                            <span>
                                ${formatDate(transaction.date)}
                            </span>

                            <span class="transaction-meta-dot"></span>

                            <span>
                                ${isIncome ? "Income" : "Expense"}
                            </span>

                        </div>

                    </div>

                </div>

                <div class="transaction-right">

                    <span class="transaction-amount ${amountClass}">
                        ${sign}${formatCurrency(transaction.amount)}
                    </span>

                    <div class="transaction-actions">

                        <button
                            class="edit-btn"
                            data-id="${transaction.id}"
                            title="Edit transaction"
                            aria-label="Edit transaction"
                        >
                            ✎
                        </button>

                        <button
                            class="delete-btn"
                            data-id="${transaction.id}"
                            title="Delete transaction"
                            aria-label="Delete transaction"
                        >
                            ×
                        </button>

                    </div>

                </div>
            `;

            transactionList.appendChild(row);
        });

        document
            .querySelectorAll(".delete-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteTransaction(
                            Number(button.dataset.id)
                        );
                    }
                );
            });

        document
            .querySelectorAll(".edit-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        editTransaction(
                            Number(button.dataset.id)
                        );
                    }
                );
            });
    }

    /* =====================================================
       DELETE
       ===================================================== */

    function deleteTransaction(id) {

        const transaction =
            transactions.find(
                item => item.id === id
            );

        if (!transaction) return;

        const confirmed =
            confirm(
                `Delete "${transaction.title}"?`
            );

        if (!confirmed) return;

        transactions =
            transactions.filter(
                item => item.id !== id
            );

        saveTransactions();
        updateDashboard();

        showToast("Transaction deleted.");
    }

    /* =====================================================
       EDIT
       ===================================================== */

    function editTransaction(id) {

        const transaction =
            transactions.find(
                item => item.id === id
            );

        if (!transaction) return;

        editingTransactionId = id;

        document.getElementById(
            "transactionTitle"
        ).value =
            transaction.title;

        document.getElementById(
            "transactionAmount"
        ).value =
            transaction.amount;

        document.getElementById(
            "transactionCategory"
        ).value =
            transaction.category;

        document.getElementById(
            "transactionDate"
        ).value =
            transaction.date;

        const radio =
            document.querySelector(
                `input[name="transactionType"][value="${transaction.type}"]`
            );

        if (radio) {
            radio.checked = true;
        }

        const modalTitle =
            modal.querySelector(".modal-header h2");

        if (modalTitle) {
            modalTitle.textContent =
                "Edit transaction";
        }

        const saveButton =
            transactionForm.querySelector(
                ".save-btn"
            );

        if (saveButton) {
            saveButton.textContent =
                "Update transaction";
        }

        openModal(false);
    }

    /* =====================================================
       CATEGORIES
       ===================================================== */

    function renderCategories() {

        const expenseTransactions =
            transactions.filter(
                transaction =>
                    transaction.type === "expense"
            );

        const totals = {};

        expenseTransactions.forEach(
            transaction => {

                const category =
                    transaction.category;

                totals[category] =
                    (totals[category] || 0) +
                    Number(transaction.amount);
            }
        );

        const categories =
            Object.entries(totals)
                .sort((a, b) => b[1] - a[1]);

        categoryList.innerHTML = "";

        if (categories.length === 0) {

            categoryList.style.display =
                "none";

            emptyCategory.style.display =
                "flex";

            return;
        }

        categoryList.style.display =
            "flex";

        emptyCategory.style.display =
            "none";

        const total =
            categories.reduce(
                (sum, item) =>
                    sum + item[1],
                0
            );

        categories.forEach(
            ([category, amount]) => {

                const percentage =
                    Math.round(
                        (amount / total) * 100
                    );

                const row =
                    document.createElement("div");

                row.className =
                    "category-row";

                row.innerHTML = `

                    <div class="category-icon">
                        ${getCategoryIcon(category)}
                    </div>

                    <div class="category-info">

                        <div class="category-info-top">

                            <span>
                                ${escapeHtml(category)}
                            </span>

                            <span>
                                ${percentage}%
                            </span>

                        </div>

                        <div class="category-progress">

                            <span
                                style="width:${percentage}%"
                            ></span>

                        </div>

                    </div>

                    <span class="category-amount">
                        ${formatCurrency(amount)}
                    </span>

                `;

                categoryList.appendChild(row);
            }
        );
    }

    /* =====================================================
       CHART
       ===================================================== */

    function renderChart() {

        const period =
            chartPeriod?.value || "all";

        const now =
            new Date();

        const currentYear =
            now.getFullYear();

        const monthlyTotals =
            Array(12).fill(0);

        transactions.forEach(transaction => {

            if (
                transaction.type !== "expense"
            ) {
                return;
            }

            const date =
                new Date(
                    `${transaction.date}T00:00:00`
                );

            if (Number.isNaN(date.getTime())) {
                return;
            }

            if (
                period === "month" &&
                (
                    date.getMonth() !==
                        now.getMonth() ||
                    date.getFullYear() !==
                        currentYear
                )
            ) {
                return;
            }

            if (
                period === "all" ||
                date.getFullYear() === currentYear
            ) {

                monthlyTotals[
                    date.getMonth()
                ] += Number(
                    transaction.amount
                );
            }
        });

        const maxValue =
            Math.max(
                ...monthlyTotals,
                100
            );

        updateChartAxis(maxValue);

        chartBars.innerHTML = "";

        monthlyTotals.forEach(
            (amount, index) => {

                const column =
                    document.createElement("div");

                column.className =
                    "bar-column";

                const height =
                    amount === 0
                        ? 2
                        : Math.max(
                            4,
                            (amount / maxValue) * 100
                        );

                const bar =
                    document.createElement("div");

                bar.className =
                    "bar";

                bar.style.height =
                    `${height}%`;

                const tooltip =
                    document.createElement("span");

                tooltip.className =
                    "bar-tooltip";

                tooltip.textContent =
                    `${getMonthName(index)}: ${formatCurrency(amount)}`;

                column.appendChild(bar);
                column.appendChild(tooltip);

                chartBars.appendChild(column);
            }
        );
    }

    function getMonthName(index) {

        return new Date(
            2000,
            index,
            1
        ).toLocaleString(
            "en-IN",
            { month: "short" }
        );
    }

    function updateChartAxis(maxValue) {

        const axis =
            document.querySelector(".y-axis");

        if (!axis) return;

        const steps = 5;

        axis.innerHTML = "";

        for (let i = steps; i >= 0; i--) {

            const value =
                Math.round(
                    (maxValue / steps) * i
                );

            const span =
                document.createElement("span");

            span.textContent =
                formatCompactCurrency(value);

            axis.appendChild(span);
        }
    }

    function formatCompactCurrency(value) {

        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        }

        if (value >= 1000) {
            return `₹${(value / 1000).toFixed(1)}k`;
        }

        return `₹${Math.round(value)}`;
    }

    /* =====================================================
       MODAL
       ===================================================== */

    function openModal(resetForm = true) {

        modal.classList.add("active");
        modal.classList.add("show");

        document.body.classList.add(
            "modal-open"
        );

        document.body.style.overflow =
            "hidden";

        if (resetForm) {

            editingTransactionId = null;

            transactionForm.reset();

            document.querySelector(
                'input[name="transactionType"][value="expense"]'
            ).checked = true;

            const modalTitle =
                modal.querySelector(
                    ".modal-header h2"
                );

            if (modalTitle) {
                modalTitle.textContent =
                    "Add transaction";
            }

            const saveButton =
                transactionForm.querySelector(
                    ".save-btn"
                );

            if (saveButton) {
                saveButton.textContent =
                    "Save transaction";
            }

            document.getElementById(
                "transactionDate"
            ).value =
                getToday();
        }

        setTimeout(() => {

            document.getElementById(
                "transactionTitle"
            )?.focus();

        }, 100);
    }

    function closeModal() {

        modal.classList.remove("active");
        modal.classList.remove("show");

        document.body.classList.remove(
            "modal-open"
        );

        document.body.style.overflow =
            "";

        transactionForm.reset();

        editingTransactionId = null;

        document.querySelector(
            'input[name="transactionType"][value="expense"]'
        ).checked = true;

        const modalTitle =
            modal.querySelector(
                ".modal-header h2"
            );

        if (modalTitle) {
            modalTitle.textContent =
                "Add transaction";
        }

        const saveButton =
            transactionForm.querySelector(
                ".save-btn"
            );

        if (saveButton) {
            saveButton.textContent =
                "Save transaction";
        }
    }

    function getToday() {

        const now =
            new Date();

        const offset =
            now.getTimezoneOffset();

        const localDate =
            new Date(
                now.getTime() -
                offset * 60 * 1000
            );

        return localDate
            .toISOString()
            .split("T")[0];
    }

    /* =====================================================
       MODAL EVENTS
       ===================================================== */

    document
        .getElementById("openModalBtn")
        .addEventListener(
            "click",
            () => openModal(true)
        );

    document
        .getElementById("emptyAddBtn")
        .addEventListener(
            "click",
            () => openModal(true)
        );

    document
        .getElementById("closeModalBtn")
        .addEventListener(
            "click",
            closeModal
        );

    document
        .getElementById("cancelModalBtn")
        .addEventListener(
            "click",
            closeModal
        );

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {
                closeModal();
            }
        }
    );

    /* =====================================================
       ADD / UPDATE TRANSACTION
       ===================================================== */

    transactionForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const title =
                document
                    .getElementById(
                        "transactionTitle"
                    )
                    .value
                    .trim();

            const amount =
                Number(
                    document
                        .getElementById(
                            "transactionAmount"
                        )
                        .value
                );

            const category =
                document
                    .getElementById(
                        "transactionCategory"
                    )
                    .value;

            const date =
                document
                    .getElementById(
                        "transactionDate"
                    )
                    .value;

            const type =
                document.querySelector(
                    'input[name="transactionType"]:checked'
                )?.value;

            if (!title) {

                showToast(
                    "Please enter a description.",
                    "error"
                );

                return;
            }

            if (!Number.isFinite(amount) || amount <= 0) {

                showToast(
                    "Please enter a valid amount.",
                    "error"
                );

                return;
            }

            if (!date) {

                showToast(
                    "Please select a date.",
                    "error"
                );

                return;
            }

            /* UPDATE */

            if (editingTransactionId !== null) {

                const transaction =
                    transactions.find(
                        item =>
                            item.id ===
                            editingTransactionId
                    );

                if (transaction) {

                    transaction.title =
                        title;

                    transaction.amount =
                        amount;

                    transaction.category =
                        category;

                    transaction.date =
                        date;

                    transaction.type =
                        type;
                }

                saveTransactions();
                updateDashboard();
                closeModal();

                showToast(
                    "Transaction updated successfully."
                );

                return;
            }

            /* CREATE */

            const transaction = {

                id:
                    Date.now() +
                    Math.floor(
                        Math.random() * 1000
                    ),

                title,
                amount,
                category,
                date,
                type
            };

            transactions.push(
                transaction
            );

            saveTransactions();
            updateDashboard();
            closeModal();

            showToast(
                type === "income"
                    ? "Income added successfully."
                    : "Expense added successfully."
            );
        }
    );

    /* =====================================================
       SEARCH + FILTER + SORT
       ===================================================== */

    transactionSearch.addEventListener(
        "input",
        renderTransactions
    );

    categoryFilter.addEventListener(
        "change",
        renderTransactions
    );

    chartPeriod?.addEventListener(
        "change",
        renderChart
    );

    /* =====================================================
       ADD SORT SELECT
       ===================================================== */

    function createSortControl() {

        const tools =
            document.querySelector(
                ".transaction-tools"
            );

        if (!tools) return;

        if (
            document.getElementById(
                "transactionSort"
            )
        ) {
            return;
        }

        const select =
            document.createElement("select");

        select.id =
            "transactionSort";

        select.setAttribute(
            "aria-label",
            "Sort transactions"
        );

        select.innerHTML = `

            <option value="newest">
                Newest
            </option>

            <option value="oldest">
                Oldest
            </option>

            <option value="highest">
                Highest amount
            </option>

            <option value="lowest">
                Lowest amount
            </option>

        `;

        tools.appendChild(select);

        select.addEventListener(
            "change",
            renderTransactions
        );
    }

    /* =====================================================
       EXPORT CSV
       ===================================================== */

    function createExportButton() {

        const header =
            document.querySelector(
                ".transactions-header"
            );

        if (!header) return;

        if (
            document.getElementById(
                "exportTransactionsBtn"
            )
        ) {
            return;
        }

        const button =
            document.createElement("button");

        button.id =
            "exportTransactionsBtn";

        button.className =
            "export-btn";

        button.innerHTML =
            "↓ Export";

        button.title =
            "Export transactions as CSV";

        header.appendChild(button);

        button.addEventListener(
            "click",
            exportCSV
        );
    }

    function exportCSV() {

        if (transactions.length === 0) {

            showToast(
                "There are no transactions to export.",
                "error"
            );

            return;
        }

        const headers = [
            "Description",
            "Amount",
            "Type",
            "Category",
            "Date"
        ];

        const rows =
            transactions.map(
                transaction => [

                    transaction.title,
                    transaction.amount,
                    transaction.type,
                    transaction.category,
                    transaction.date
                ]
            );

        const csv = [
            headers,
            ...rows
        ]
            .map(row =>
                row.map(value =>
                    `"${String(value)
                        .replaceAll('"', '""')}"`
                ).join(",")
            )
            .join("\n");

        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `spendwise-transactions-${getToday()}.csv`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        showToast(
            "Transactions exported successfully."
        );
    }

    /* =====================================================
       CLEAR ALL
       ===================================================== */

    function createClearButton() {

        const header =
            document.querySelector(
                ".transactions-header"
            );

        if (!header) return;

        if (
            document.getElementById(
                "clearTransactionsBtn"
            )
        ) {
            return;
        }

        const button =
            document.createElement("button");

        button.id =
            "clearTransactionsBtn";

        button.className =
            "clear-btn";

        button.textContent =
            "Clear all";

        header.appendChild(button);

        button.addEventListener(
            "click",
            () => {

                if (
                    transactions.length === 0
                ) {

                    showToast(
                        "There are no transactions to clear.",
                        "error"
                    );

                    return;
                }

                const confirmed =
                    confirm(
                        "Delete ALL your transactions? This cannot be undone."
                    );

                if (!confirmed) return;

                transactions = [];

                saveTransactions();
                updateDashboard();

                showToast(
                    "All transactions have been cleared."
                );
            }
        );
    }

    /* =====================================================
       THEME
       ===================================================== */

    const themeToggle =
        document.getElementById(
            "themeToggle"
        );

    const themeIcon =
        document.getElementById(
            "themeIcon"
        );

    const themeText =
        document.getElementById(
            "themeText"
        );

    function applyTheme() {

        const dark =
            localStorage.getItem(
                "spendwiseDarkMode"
            ) === "true";

        document.body.classList.toggle(
            "dark-mode",
            dark
        );

        themeIcon.textContent =
            dark ? "☀" : "☾";

        themeText.textContent =
            dark
                ? "Light mode"
                : "Dark mode";
    }

    themeToggle.addEventListener(
        "click",
        () => {

            const dark =
                !document.body.classList.contains(
                    "dark-mode"
                );

            localStorage.setItem(
                "spendwiseDarkMode",
                dark
            );

            applyTheme();
        }
    );

    applyTheme();

    /* =====================================================
       LOGOUT
       ===================================================== */

    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Are you sure you want to log out?"
                    );

                if (!confirmed) return;

                localStorage.removeItem(
                    "spendwiseCurrentUser"
                );

                window.location.href =
                    "../index.html";
            }
        );

    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );

    const mobileMenuToggle =
        document.getElementById(
            "mobileMenuToggle"
        );

    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

        overlay.classList.remove(
            "active"
        );

        mobileMenuToggle.setAttribute(
            "aria-label",
            "Open menu"
        );
    }

    mobileMenuToggle.addEventListener(
        "click",
        () => {

            const open =
                sidebar.classList.toggle(
                    "open"
                );

            overlay.classList.toggle(
                "active",
                open
            );

            mobileMenuToggle.setAttribute(
                "aria-label",
                open
                    ? "Close menu"
                    : "Open menu"
            );
        }
    );

    overlay.addEventListener(
        "click",
        closeSidebar
    );

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(nav =>
                            nav.classList.remove(
                                "active"
                            )
                        );

                    item.classList.add(
                        "active"
                    );

                    closeSidebar();
                }
            );
        });

    /* =====================================================
       KEYBOARD SHORTCUTS
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                if (
                    modal.classList.contains(
                        "active"
                    )
                ) {
                    closeModal();
                }

                closeSidebar();
            }

            /* N = New transaction */

            if (
                event.key.toLowerCase() === "n" &&
                !isTyping(event.target) &&
                !modal.classList.contains("active")
            ) {
                openModal(true);
            }
        }
    );

    function isTyping(element) {

        if (!element) return false;

        const tag =
            element.tagName?.toLowerCase();

        return (
            tag === "input" ||
            tag === "textarea" ||
            tag === "select" ||
            element.isContentEditable
        );
    }

    /* =====================================================
       INITIALIZE
       ===================================================== */

    createSortControl();
    createExportButton();
    createClearButton();

    updateDashboard();

});
