# Harmony Search Optimization Demo

## Overview

A web-based demonstration of the **Harmony Search (HS)** metaheuristic algorithm for continuous optimization problems.
This project provides both **interactive demos** and **AI-generated media** to visualize and explore the algorithm’s behavior.

---

## Features

* **Interactive Harmony Search**: Customize HS parameters and run experiments in real time
* **Benchmark Functions**: Sphere, Rastrigin, Rosenbrock, Ackley, and Griewank
* **Visualization**:

  * Real-time convergence plots
  * Harmony memory snapshots at key iterations
  * 2D function visualizations for two-dimensional problems
* **Demo Mode**: Predefined harmony memory for reproducible demonstrations
* **AI-Generated Media**:

  * `photo/`: Images generated to illustrate HS concepts
  * `video/`: Short videos showing algorithm evolution
* **Responsive Interface**: Modern web interface with intuitive controls

---

## Repository Structure

```
harmony-search-demo/
├── photo/
│   ├─ generated_images/   # AI-generated images
│   └─ prompts.docx        # Prompts used for image generation
├── video/
│   ├─ generated_videos/   # AI-generated videos
│   └─ prompts.txt         # Prompts used for video generation
├── demo/
│   ├── backend/           # Flask API + Harmony Search algorithm
│   │   ├─ harmony_search.py
│   │   └─ requirements.txt
│   └── frontend/          # Web interface
│       ├─ index.html
│       ├─ harmony_search.js
│       ├─ style.css
│       └─ assets/         # Images, icons, and resources
└── README.md              # This file
```

---

## Installation & Usage

### Backend Setup (Flask API)

```bash
cd demo/backend
pip install -r requirements.txt
python harmony_search.py
```

The API will run at: `http://localhost:5000`

### Frontend Setup

1. Ensure the backend is running
2. Open `demo/frontend/index.html` in a web browser
   OR serve it locally:

```bash
cd demo/frontend
python -m http.server 8080
```

3. Access via `http://localhost:8080`

---

### Demo Mode Example

```python
demo_hms = [
    [-3.5, 4.2],
    [2.8, -3.1],
    [-1.7, -2.9],
    [4.5, 1.6],
    [0.9, -4.3]
]
```

Demo mode ensures reproducible visualizations of harmony memory evolution.

---

## API Usage

**Endpoint:** `POST /api/harmony_search`

**Request Example**

```json
{
  "function_name": "sphere",
  "dimensions": 2,
  "hms": 5,
  "hmcr": 0.9,
  "par": 0.3,
  "max_iterations": 100,
  "demo_mode": true
}
```

**Response Example**

```json
{
  "best_solution": [...],
  "best_fitness": 0.0,
  "snapshots": [...],
  "convergence": [...],
  "avg_convergence": [...]
}
```

**Parameters**

| Parameter        | Description                       | Range                                           | Default |
| ---------------- | --------------------------------- | ----------------------------------------------- | ------- |
| `function_name`  | Optimization function             | sphere, rastrigin, rosenbrock, ackley, griewank | sphere  |
| `dimensions`     | Number of variables               | 1-30                                            | 2       |
| `hms`            | Harmony Memory Size               | 3-50                                            | 5       |
| `hmcr`           | Harmony Memory Consideration Rate | 0.0-1.0                                         | 0.9     |
| `par`            | Pitch Adjustment Rate             | 0.0-1.0                                         | 0.3     |
| `max_iterations` | Max iterations                    | 10-1000                                         | 100     |
| `demo_mode`      | Use predefined memory             | true/false                                      | true    |

---

## Algorithm Overview

1. **Initialization**: Create initial harmony memory (HM)
2. **Improvisation**:

   * Memory consideration (HMCR)
   * Pitch adjustment (PAR)
   * Random generation
3. **Evaluation**: Compute fitness of new harmony
4. **Update**: Replace worst harmony if improved
5. **Repeat**: Until stopping criteria met

**Benchmark Functions**:

* **Sphere**: ( f(x) = \sum x_i^2 )
* **Rastrigin**: ( f(x) = 10n + \sum (x_i^2 - 10\cos(2\pi x_i)) )
* **Rosenbrock**: ( f(x) = \sum [100(x_{i+1} - x_i^2)^2 + (x_i - 1)^2] )
* **Ackley**: ( f(x) = -20\exp(-0.2\sqrt{\frac{1}{n}\sum x_i^2}) - \exp(\frac{1}{n}\sum \cos(2\pi x_i)) + 20 + e )
* **Griewank**: ( f(x) = 1 + \frac{1}{4000}\sum x_i^2 - \prod \cos(x_i / \sqrt{i}) )

---

## Extending the Project

* **Add new functions**:

  * Define in `demo/backend/harmony_search.py`
  * Update `calculate_fitness()`
  * Add to frontend dropdown
* **Customize visualizations**:

  * Modify Chart.js settings in `demo/frontend/harmony_search.js`
  * Adjust snapshot intervals or CSS for UI themes

---

## Testing

Test the API:

```bash
curl -X POST http://localhost:5000/api/harmony_search \
  -H "Content-Type: application/json" \
  -d '{"function_name":"sphere","dimensions":2,"hms":5,"hmcr":0.9,"par":0.3,"max_iterations":50,"demo_mode":true}'
```

---

## Dependencies

**Backend**

* Flask 2.3+
* Flask-CORS 4+
* NumPy 1.24+

**Frontend**

* Modern web browser
* Chart.js 4.3+

---

## References

* Geem, Z. W., Kim, J. H., & Loganathan, G. V. (2001). *A new heuristic optimization algorithm: harmony search.* Simulation, 76(2), 60-68.
* Yang, X. S. (2010). *Nature-Inspired Metaheuristic Algorithms.* Luniver Press.
* Benchmark functions: [Wikipedia](https://en.wikipedia.org/wiki/Test_functions_for_optimization)

---

## License

MIT License
