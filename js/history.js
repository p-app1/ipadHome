// Load and display week history
const STORAGE_KEYS = {
    weeks: 'ipadHome_weeks'
};

let weeks = [];

document.addEventListener('DOMContentLoaded', () => {
    loadWeeks();
    renderHistory();
    
    const modal = document.getElementById('weekModal');
    const closeBtn = document.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

function loadWeeks() {
    const weeksData = localStorage.getItem(STORAGE_KEYS.weeks);
    if (weeksData) {
        weeks = JSON.parse(weeksData);
    }
}

function renderHistory() {
    const content = document.getElementById('historyContent');
    
    if (weeks.length === 0) {
        content.innerHTML = '<div class="no-weeks">No archived weeks yet. Start archiving weeks to see history here!</div>';
        return;
    }
    
    let html = '<div class="weeks-list">';
    
    weeks.forEach((week, idx) => {
        const weekNum = weeks.length - idx;
        html += `
            <div class="week-card">
                <div class="week-header">
                    <div class="week-title">Week ${weekNum}</div>
                    <div class="week-dates">${week.startDate} to ${week.endDate}</div>
                </div>
                <div class="week-stats">
                    <div class="stat">
                        <span class="stat-label">Budget Set:</span>
                        <span class="stat-value">+${week.budgetSet.toFixed(2)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Spent:</span>
                        <span class="stat-value">-${week.totalSpent.toFixed(2)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Net:</span>
                        <span class="stat-value ${week.net >= 0 ? 'positive' : 'negative'}">
                            ${week.net >= 0 ? '+' : ''}${week.net.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div class="week-actions">
                    <button class="btn-view" onclick="viewWeek(${idx})">View Details</button>
                    <button class="btn-delete" onclick="deleteWeek(${idx})">Delete</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

function viewWeek(idx) {
    const week = weeks[idx];
    const modal = document.getElementById('weekModal');
    const modalBody = document.getElementById('modalBody');
    
    let transactionsHtml = week.transactions.length > 0 
        ? week.transactions.map(t => `<li>${t.label}: -${t.amount.toFixed(2)}</li>`).join('')
        : '<li>No transactions</li>';
    
    let todosHtml = week.todos.length > 0
        ? week.todos.map(t => `<li>${t.completed ? '✓' : '○'} ${t.text}</li>`).join('')
        : '<li>No todos</li>';
    
    let plannerHtml = Object.entries(week.planner)
        .map(([day, notes]) => `<div class="planner-entry"><strong>${day}:</strong> ${notes || '(empty)'}</div>`)
        .join('');
    
    modalBody.innerHTML = `
        <h2>Week ${idx + 1} - Details</h2>
        <div class="detail-section">
            <h3>Budget</h3>
            <p>Set: +${week.budgetSet.toFixed(2)}</p>
            <p>Spent: -${week.totalSpent.toFixed(2)}</p>
            <p><strong>Net: ${week.net >= 0 ? '+' : ''}${week.net.toFixed(2)}</strong></p>
        </div>
        
        <div class="detail-section">
            <h3>Transactions</h3>
            <ul>${transactionsHtml}</ul>
        </div>
        
        <div class="detail-section">
            <h3>Todos</h3>
            <ul>${todosHtml}</ul>
        </div>
        
        <div class="detail-section">
            <h3>Planner Notes</h3>
            ${plannerHtml || '<p>(no notes)</p>'}
        </div>
    `;
    
    modal.style.display = 'block';
}

function deleteWeek(idx) {
    if (confirm('Delete this week? This cannot be undone.')) {
        weeks.splice(idx, 1);
        localStorage.setItem(STORAGE_KEYS.weeks, JSON.stringify(weeks));
        renderHistory();
    }
}
