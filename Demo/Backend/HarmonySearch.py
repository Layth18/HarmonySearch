from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

# ------------------------------
# Flask App Setup
# ------------------------------
app = Flask(__name__)
CORS(app)  # Allow frontend requests

# ------------------------------
# Objective Functions
# ------------------------------
def sphere(x):
    return np.sum(x ** 2)

def rastrigin(x):
    n = len(x)
    return 10 * n + np.sum(x ** 2 - 10 * np.cos(2 * np.pi * x))

def rosenbrock(x):
    return np.sum(100 * (x[1:] - x[:-1] ** 2) ** 2 + (x[:-1] - 1) ** 2)

def ackley(x):
    n = len(x)
    return (
        -20 * np.exp(-0.2 * np.sqrt(np.sum(x ** 2) / n))
        - np.exp(np.sum(np.cos(2 * np.pi * x)) / n)
        + 20
        + np.e
    )

def griewank(x):
    n = len(x)
    return 1 + np.sum(x ** 2) / 4000 - np.prod(
        np.cos(x / np.sqrt(np.arange(1, n + 1)))
    )

# Function registry
FUNCTIONS = {
    "sphere": sphere,
    "rastrigin": rastrigin,
    "rosenbrock": rosenbrock,
    "ackley": ackley,
    "griewank": griewank,
}

# Fixed demo Harmony Memory for deterministic snapshots
DEMO_INITIAL_HM = np.array([
    [-3.5,  4.2],
    [ 2.8, -3.1],
    [-1.7, -2.9],
    [ 4.5,  1.6],
    [ 0.9, -4.3],
])

# ------------------------------
# Harmony Search Algorithm
# ------------------------------
def harmony_search(
    func,
    func_name,
    dimensions=2,
    hms=10,
    hmcr=0.9,
    par=0.3,
    max_iterations=100,
    demo_mode=False,
):

    # Initialize Harmony Memory
    if demo_mode:
        HM = DEMO_INITIAL_HM.copy()
        hms = len(HM)
    else:
        HM = [np.random.uniform(-5, 5, dimensions) for _ in range(hms)]

    HM = np.array(HM)
    HM_fitness = [func(h) for h in HM]

    convergence = []
    snapshots = []

    # Snapshot iterations: 0%, 25%, 50%, 75%, 100%
    snapshot_iters = {
        0,
        max_iterations // 4,
        max_iterations // 2,
        (3 * max_iterations) // 4,
        max_iterations - 1,
    }

    for it in range(max_iterations):
        new_harmony = np.zeros(dimensions)

        # Improvise new harmony
        for i in range(dimensions):
            if np.random.rand() < hmcr:
                new_harmony[i] = HM[np.random.randint(0, hms)][i]
                if np.random.rand() < par:
                    new_harmony[i] += np.random.normal(0, 0.1)
            else:
                new_harmony[i] = np.random.uniform(-5, 5)

        new_fitness = func(new_harmony)

        # Replace worst harmony if better
        worst_idx = np.argmax(HM_fitness)
        if new_fitness < HM_fitness[worst_idx]:
            HM[worst_idx] = new_harmony
            HM_fitness[worst_idx] = new_fitness

        # Track convergence
        best_idx = np.argmin(HM_fitness)
        convergence.append({
            "iteration": it + 1,
            "bestFitness": float(HM_fitness[best_idx]),
            "averageFitness": float(np.mean(HM_fitness)),
        })

        # Snapshot harmony memory
        if it in snapshot_iters:
            snapshot = [
                {
                    "solution": HM[i].tolist(),
                    "fitness": float(HM_fitness[i]),
                }
                for i in range(len(HM))  # ensures correct HM size
            ]
            snapshot.sort(key=lambda x: x["fitness"])
            snapshots.append({
                "iteration": it + 1,
                "memory": snapshot,
            })

    # Final best solution
    best_idx = np.argmin(HM_fitness)
    best_solution = {
        "solution": HM[best_idx].tolist(),
        "fitness": float(HM_fitness[best_idx]),
    }

    return {
        "bestSolution": best_solution,
        "convergenceData": convergence,
        "snapshots": snapshots,
        "parameters": {
            "function_name": func_name,
            "dimensions": dimensions,
            "hms": hms,
            "hmcr": hmcr,
            "par": par,
            "max_iterations": max_iterations,
        },
    }

# ------------------------------
# API Route
# ------------------------------
@app.route("/api/harmony_search", methods=["POST"])
def api_harmony_search():
    data = request.get_json()

    func_name = data.get("function_name", "sphere")
    func = FUNCTIONS.get(func_name, sphere)

    dimensions = int(data.get("dimensions", 2))
    hms = int(data.get("hms", 10))
    hmcr = float(data.get("hmcr", 0.9))
    par = float(data.get("par", 0.3))
    max_iterations = int(data.get("max_iterations", 100))
    demo_mode = bool(data.get("demo_mode", False))

    result = harmony_search(
        func=func,
        func_name=func_name,
        dimensions=dimensions,
        hms=hms,
        hmcr=hmcr,
        par=par,
        max_iterations=max_iterations,
        demo_mode=demo_mode,
    )

    return jsonify(result)

# ------------------------------
# Run Server
# ------------------------------
if __name__ == "__main__":
    print("🎷 Harmony Search API running at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
