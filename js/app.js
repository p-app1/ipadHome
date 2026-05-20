// Storage keys
const STORAGE_KEYS = {
    transactions: 'ipadHome_transactions',
    todos: 'ipadHome_todos',
    planner: 'ipadHome_planner',
    budgetBalance: 'ipadHome_budgetBalance',
    lastUpdated: 'ipadHome_lastUpdated',
    weeks: 'ipadHome_weeks',
    currentWeekStart: 'ipadHome_currentWeekStart'
};

// Data structures
let data = {
    budgetBalance: 0,
    transactions: [],
    todos: [],
    planner: {
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: '',
        Saturday: '',
        Sunday: ''
    }
};

let weeks = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initBudget();
    initTodos();
    initPlanner();
    updateTimestamp();
    updateClock();
    setInterval(updateClock, 1000); // Update clock every second
    initWeekSystem();
});

// ============ BUDGET SECTION ============
function initBudget() {
    const balanceInput = document.getElementById('budgetBalance');
    
    // Set initial value
    balanceInput.value = data.budgetBalance;
    
    // Listen for changes to budget
    balanceInput.addEventListener('change', (e) => {
        data.budgetBalance = parseFloat(e.target.value) || 0;
        saveData();
        updateNetAmount();
    });

    document.getElementById('addTransactionBtn').addEventListener('click', addTransaction);
    document.getElementById('transactionInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTransaction();
    });
    
    renderBudget();
}

function addTransaction() {
    const labelInput = document.getElementById('transactionLabel');
    const amountInput = document.getElementById('transactionInput');
    const label = labelInput.value.trim();
    const amount = Math.abs(parseFloat(amountInput.value)) || 0;

    if (!label || amount === 0) {
        alert('Please enter a category and amount');
        return;
    }

    const transaction = {
        id: Date.now(),
        label: label,
        amount: amount,
        date: new Date().toLocaleDateString()
    };

    data.transactions.unshift(transaction);
    saveData();
    labelInput.value = '';
    amountInput.value = '';
    renderBudget();
}

function renderBudget() {
    renderTransactions();
    updateNetAmount();
}

function updateNetAmount() {
    let totalSpent = 0;
    data.transactions.forEach((t) => {
        totalSpent += t.amount;
    });
    const net = data.budgetBalance - totalSpent;
    document.getElementById('budgetNet').textContent = net.toFixed(2);
}

function renderTransactions() {
    const listEl = document.getElementById('transactionList');
    listEl.innerHTML = '';

    data.transactions.forEach((t) => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <span class="transaction-label-display">${t.label}</span>
            <span class="transaction-amount">-${t.amount.toFixed(2)}</span>
            <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
        `;
        listEl.appendChild(item);
    });
}

function deleteTransaction(id) {
    data.transactions = data.transactions.filter((t) => t.id !== id);
    saveData();
    renderBudget();
}

// ============ TODO SECTION ============
function initTodos() {
    document.getElementById('addTodoBtn').addEventListener('click', addTodo);
    renderTodos();
}

function addTodo() {
    const todo = {
        id: Date.now(),
        text: '',
        completed: false
    };

    data.todos.unshift(todo);
    saveData();
    renderTodos();
    // Focus on new input
    setTimeout(() => {
        document.querySelector(`#todo-${todo.id}`)?.focus();
    }, 0);
}

function renderTodos() {
    const listEl = document.getElementById('todoList');
    listEl.innerHTML = '';

    data.todos.forEach((todo) => {
        const item = document.createElement('div');
        item.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        item.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <input type="text" id="todo-${todo.id}" value="${todo.text}" placeholder="Add a task...">
            <button class="btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
        `;

        // Add event listeners
        item.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
            todo.completed = e.target.checked;
            saveData();
            renderTodos();
        });

        item.querySelector('input[type="text"]').addEventListener('input', (e) => {
            todo.text = e.target.value;
            saveData();
        });

        listEl.appendChild(item);
    });
}

function deleteTodo(id) {
    data.todos = data.todos.filter((t) => t.id !== id);
    saveData();
    renderTodos();
}

// ============ PLANNER SECTION ============
function initPlanner() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grid = document.getElementById('plannerGrid');
    grid.innerHTML = '';

    days.forEach((day) => {
        const dayEl = document.createElement('div');
        dayEl.className = 'planner-day';

        const dayNameEl = document.createElement('div');
        dayNameEl.className = 'planner-day-name';
        dayNameEl.textContent = day;

        const textareaEl = document.createElement('textarea');
        textareaEl.placeholder = 'nothing';
        textareaEl.value = data.planner[day];
        textareaEl.addEventListener('input', (e) => {
            data.planner[day] = e.target.value;
            saveData();
        });

        dayEl.appendChild(dayNameEl);
        dayEl.appendChild(textareaEl);
        grid.appendChild(dayEl);
    });
}

// ============ STORAGE & UTILITY ============
function saveData() {
    localStorage.setItem(STORAGE_KEYS.budgetBalance, data.budgetBalance);
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(data.transactions));
    localStorage.setItem(STORAGE_KEYS.todos, JSON.stringify(data.todos));
    localStorage.setItem(STORAGE_KEYS.planner, JSON.stringify(data.planner));
    localStorage.setItem(STORAGE_KEYS.weeks, JSON.stringify(weeks));
    localStorage.setItem(STORAGE_KEYS.lastUpdated, new Date().toISOString());
    updateTimestamp();
}

function loadData() {
    const budgetBalance = localStorage.getItem(STORAGE_KEYS.budgetBalance);
    const transactions = localStorage.getItem(STORAGE_KEYS.transactions);
    const todos = localStorage.getItem(STORAGE_KEYS.todos);
    const planner = localStorage.getItem(STORAGE_KEYS.planner);
    const weeksData = localStorage.getItem(STORAGE_KEYS.weeks);

    if (budgetBalance) data.budgetBalance = parseFloat(budgetBalance);
    if (transactions) data.transactions = JSON.parse(transactions);
    if (todos) data.todos = JSON.parse(todos);
    if (planner) {
        const loaded = JSON.parse(planner);
        data.planner = loaded;
    }
    if (weeksData) weeks = JSON.parse(weeksData);
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
    });
    
    document.getElementById('timeDisplay').textContent = timeStr;
    document.getElementById('dateDisplay').textContent = dateStr;
}

function updateTimestamp() {
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.lastUpdated);
    const el = document.getElementById('lastUpdated');

    if (!lastUpdated) {
        el.textContent = 'Updated: Just now';
        return;
    }

    const date = new Date(lastUpdated);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) {
        el.textContent = 'Updated: Just now';
    } else if (diff < 3600) {
        el.textContent = `Updated: ${Math.floor(diff / 60)}m ago`;
    } else if (diff < 86400) {
        el.textContent = `Updated: ${Math.floor(diff / 3600)}h ago`;
    } else {
        el.textContent = `Updated: ${date.toLocaleDateString()}`;
    }
}

// Update timestamp every minute
setInterval(updateTimestamp, 60000);

// ============ WEEK SYSTEM ============
function initWeekSystem() {
    const weekStartBtn = document.getElementById('endWeekBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    
    if (weekStartBtn) {
        weekStartBtn.addEventListener('click', archiveWeek);
    }
    if (viewHistoryBtn) {
        viewHistoryBtn.addEventListener('click', () => {
            window.location.href = 'history.html';
        });
    }
}

function archiveWeek() {
    const totalSpent = data.transactions.reduce((sum, t) => sum + t.amount, 0);
    const net = data.budgetBalance - totalSpent;
    
    const now = new Date();
    const weekStart = getMonday(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekSnapshot = {
        id: Date.now(),
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        budgetSet: data.budgetBalance,
        totalSpent: totalSpent,
        net: net,
        transactions: JSON.parse(JSON.stringify(data.transactions)),
        todos: JSON.parse(JSON.stringify(data.todos)),
        planner: JSON.parse(JSON.stringify(data.planner))
    };
    
    weeks.push(weekSnapshot);
    
    // Reset for new week
    data.transactions = [];
    data.todos = [];
    // Keep planner as reference
    
    saveData();
    alert(`Week archived! (${weekSnapshot.startDate} to ${weekSnapshot.endDate})\nNet: ${net.toFixed(2)}`);
    location.reload();
}

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}
