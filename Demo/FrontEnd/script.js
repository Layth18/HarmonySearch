/**
 * Harmony Search Optimization - Enhanced Frontend JavaScript
 */

const formulas = {
    sphere: 'f(x) = Σ(xi²)',
    rastrigin: 'f(x) = 10n + Σ(xi² - 10cos(2πxi))',
    rosenbrock: 'f(x) = Σ(100(xi+1 - xi²)² + (xi - 1)²)',
    ackley: 'f(x) = -20exp(-0.2√(Σxi²/n)) - exp(Σcos(2πxi)/n) + 20 + e',
    griewank: 'f(x) = 1 + Σ(xi²/4000) - Π(cos(xi/√i))'
};

let chart = null;
let isRunning = false;
let functionChart = null;

// Demo mode default parameters
const DEMO_DEFAULTS = {
    hms: 5,
    dimensions: 2,
    hmcr: 0.9,
    par: 0.3
};

function updateFormula() {
    const func = document.getElementById('functionSelect').value;
    document.getElementById('formula').textContent = formulas[func];
}

function toggleDemoMode() {
    const demoMode = document.getElementById('demoMode').checked;
    const hmsInput = document.getElementById('hms');
    const dimensionsInput = document.getElementById('dimensions');
    const hmcrInput = document.getElementById('hmcr');
    const parInput = document.getElementById('par');

    if (demoMode) {
        hmsInput.value = 5;
        dimensionsInput.value = 2;
        hmsInput.disabled = true;
        dimensionsInput.disabled = true;

        hmcrInput.value = 0.9;
        parInput.value = 0.3;
    } else {
        hmsInput.disabled = false;
        dimensionsInput.disabled = false;
    }
}


async function runOptimization() {
    if (isRunning) return;
    
    isRunning = true;
    const runBtn = document.getElementById('runBtn');
    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Running...</span>';

    const params = {
    function_name: document.getElementById('functionSelect').value,
    hms: parseInt(document.getElementById('hms').value),
    hmcr: parseFloat(document.getElementById('hmcr').value),
    par: parseFloat(document.getElementById('par').value),
    max_iterations: parseInt(document.getElementById('maxIterations').value),
    dimensions: parseInt(document.getElementById('dimensions').value),
    demo_mode: document.getElementById('demoMode').checked
};


    try {
        const response = await fetch('http://localhost:5000/api/harmony_search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            throw new Error('Server error');
        }

        const results = await response.json();
        displayResults(results);
    } catch (error) {
        alert('Error: Make sure the Python backend server is running on port 5000!\n\nRun: python harmony_search.py');
        console.error(error);
    }

    isRunning = false;
    runBtn.disabled = false;
    runBtn.innerHTML = '<span class="btn-icon">▶️</span><span>Run Optimization</span>';
}

function displayResults(results) {
    const resultsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Best Fitness</div>
                <div class="stat-value">${results.bestSolution.fitness.toFixed(6)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Iterations</div>
                <div class="stat-value">${results.convergenceData.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Dimensions</div>
                <div class="stat-value">${results.parameters.dimensions}</div>
            </div>
        </div>
        <div class="solution-tags">
            <div class="stat-label" style="margin-bottom: 8px;">Best Solution</div>
            ${results.bestSolution.solution.map((val, idx) => 
                `<span class="tag">x${idx + 1}: ${val.toFixed(4)}</span>`
            ).join('')}
        </div>
    `;
    document.getElementById('resultsContainer').innerHTML = resultsHTML;

    displayChart(results.convergenceData);
    displaySnapshots(results.snapshots, results.parameters.dimensions);

    if (results.parameters.dimensions === 2) {
        displayFunctionVisualization(results);
    } else {
        document.getElementById('functionVizCard').style.display = 'none';
    }
}


function evaluateTestFunction(funcName, x) {
    const [x1, x2] = x;
    
    switch(funcName) {
        case 'sphere':
            return x1*x1 + x2*x2;
        
        case 'rastrigin':
            return 20 + (x1*x1 - 10*Math.cos(2*Math.PI*x1)) + 
                       (x2*x2 - 10*Math.cos(2*Math.PI*x2));
        
        case 'rosenbrock':
            return 100*(x2 - x1*x1)**2 + (x1 - 1)**2;
        
        case 'ackley':
            const sum1 = (x1*x1 + x2*x2) / 2;
            const sum2 = (Math.cos(2*Math.PI*x1) + Math.cos(2*Math.PI*x2)) / 2;
            return -20*Math.exp(-0.2*Math.sqrt(sum1)) - Math.exp(sum2) + 20 + Math.E;
        
        case 'griewank':
            const sumPart = (x1*x1 + x2*x2) / 4000;
            const prodPart = Math.cos(x1/Math.sqrt(1)) * Math.cos(x2/Math.sqrt(2));
            return 1 + sumPart - prodPart;
        
        default:
            return 0;
    }
}

function displayChart(convergenceData) {
    document.getElementById('chartCard').style.display = 'block';

    const ctx = document.getElementById('convergenceChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: convergenceData.map(d => d.iteration),
            datasets: [
                {
                    label: 'Best Fitness',
                    data: convergenceData.map(d => d.bestFitness),
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 0,
                    fill: true
                },
                {
                    label: 'Average Fitness',
                    data: convergenceData.map(d => d.averageFitness),
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { 
                        color: '#cbd5e1', 
                        font: { family: 'Inter', size: 12 } 
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Iteration',
                        color: '#cbd5e1',
                        font: { family: 'Inter', size: 14 }
                    },
                    ticks: { 
                        color: '#cbd5e1', 
                        font: { family: 'Inter' } 
                    },
                    grid: { color: 'rgba(212, 175, 55, 0.2)' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Fitness',
                        color: '#cbd5e1',
                        font: { family: 'Inter', size: 14 }
                    },
                    ticks: { 
                        color: '#cbd5e1', 
                        font: { family: 'Inter' } 
                    },
                    grid: { color: 'rgba(212, 175, 55, 0.2)' }
                }
            }
        }
    });
}

function displaySnapshots(snapshots, dimensions) {
    document.getElementById('snapshotsCard').style.display = 'block';
    
    const totalIterations = snapshots[snapshots.length - 1].iteration;
    const targetIterations = [
        1,
        Math.floor(totalIterations * 0.25),
        Math.floor(totalIterations * 0.5),
        Math.floor(totalIterations * 0.75),
        totalIterations
    ];
    
    const selectedSnapshots = targetIterations.map(target => {
        return snapshots.reduce((prev, curr) => {
            return Math.abs(curr.iteration - target) < Math.abs(prev.iteration - target) ? curr : prev;
        });
    });
    
    const row1 = [selectedSnapshots[0], selectedSnapshots[1]];
    const row2 = [selectedSnapshots[2], selectedSnapshots[3]];
    const row3 = [selectedSnapshots[4]];
    
    const snapshotsHTML = `
    <div class="snapshot-row">
        ${row1.map((snapshot, idx) => {
            const percentage = idx * 25;
            return `
                <div class="snapshot-container">
                    <div class="snapshot-title">
                        🎵 Iteration ${snapshot.iteration} (${percentage}%)
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                ${Array.from({length: dimensions}, (_, i) => `<th>x${i+1}</th>`).join('')}
                                <th>Fitness</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${snapshot.memory.map((harmony, harmonyIdx) => `
                                <tr class="${harmonyIdx === 0 ? 'best-solution' : ''}">
                                    <td class="rank">#${harmonyIdx+1}</td>
                                    ${harmony.solution.map(val => `<td class="dimension-value">${val.toFixed(4)}</td>`).join('')}
                                    <td class="fitness">${harmony.fitness.toFixed(6)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }).join('')}
    </div>

    <div class="snapshot-row">
        ${row2.map((snapshot, idx) => {
            const percentage = (idx + 2) * 25;
            return `
                <div class="snapshot-container">
                    <div class="snapshot-title">
                        🎵 Iteration ${snapshot.iteration} (${percentage}%)
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                ${Array.from({length: dimensions}, (_, i) => `<th>x${i+1}</th>`).join('')}
                                <th>Fitness</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${snapshot.memory.map((harmony, harmonyIdx) => `
                                <tr class="${harmonyIdx === 0 ? 'best-solution' : ''}">
                                    <td class="rank">#${harmonyIdx+1}</td>
                                    ${harmony.solution.map(val => `<td class="dimension-value">${val.toFixed(4)}</td>`).join('')}
                                    <td class="fitness">${harmony.fitness.toFixed(6)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }).join('')}
    </div>

    <div class="snapshot-row full-width-row">
        <div class="snapshot-container">
            <div class="snapshot-title">
                🎵 Iteration ${row3[0].iteration} (100%)
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        ${Array.from({length: dimensions}, (_, i) => `<th>x${i+1}</th>`).join('')}
                        <th>Fitness</th>
                    </tr>
                </thead>
                <tbody>
                    ${row3[0].memory.map((harmony, idx) => `
                        <tr class="${idx === 0 ? 'best-solution' : ''}">
                            <td class="rank">#${idx+1}</td>
                            ${harmony.solution.map(v => `<td class="dimension-value">${v.toFixed(4)}</td>`).join('')}
                            <td class="fitness">${harmony.fitness.toFixed(6)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
`;

    document.getElementById('snapshotsContainer').innerHTML = snapshotsHTML;
}

function reset() {
    document.getElementById('resultsContainer').innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🎺</div>
            <h3>Ready to Optimize</h3>
            <p>Configure your parameters and click "Run Optimization"</p>
        </div>
    `;
    document.getElementById('chartCard').style.display = 'none';
    document.getElementById('snapshotsCard').style.display = 'none';
    document.getElementById('functionVizCard').style.display = 'none';
    
    if (chart) {
        chart.destroy();
        chart = null;
    }
    
    if (functionChart) {
        functionChart.destroy();
        functionChart = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Harmony Search Interface loaded');
    console.log('Make sure to run: python harmony_search.py');
});