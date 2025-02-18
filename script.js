document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("addRowBtn").addEventListener("click", addRow);
    document.getElementById("findPathBtn").addEventListener("click", runAStar);
});

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(node, cost) {
        this.elements.push({ node, cost });
        this.elements.sort((a, b) => a.cost - b.cost);
    }

    dequeue() {
        return this.elements.shift().node;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

let graph = {};

function addRow() {
    let table = document.getElementById("graphTable").getElementsByTagName("tbody")[0];
    let row = table.insertRow();
    
    for (let i = 0; i < 4; i++) {
        let cell = row.insertCell(i);
        let input = document.createElement("input");
        cell.appendChild(input);
    }

    let deleteCell = row.insertCell(4);
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Remove";
    deleteBtn.onclick = () => row.remove();
    deleteCell.appendChild(deleteBtn);
}

function runAStar() {
    let table = document.getElementById("graphTable").getElementsByTagName("tbody")[0];
    graph = {};

    for (let row of table.rows) {
        let src = row.cells[0].firstChild.value.trim();
        let dest = row.cells[1].firstChild.value.trim();
        let heuristic = parseFloat(row.cells[2].firstChild.value.trim());
        let cost = parseFloat(row.cells[3].firstChild.value.trim());

        if (!graph[src]) graph[src] = {};
        if (!graph[dest]) graph[dest] = {}; 

        graph[src][dest] = { cost, heuristic };
    }

    let startNode = document.getElementById("startNode").value.trim();
    let endNode = document.getElementById("endNode").value.trim();
    
    let result = aStarAlgorithm(startNode, endNode);
    displayPath(result.path, result.fValues, endNode);  // Pass the goal here
}

function aStarAlgorithm(start, goal) {
    let openSet = new PriorityQueue();
    openSet.enqueue(start, 0);

    let cameFrom = {};
    let gScore = { [start]: 0 };
    let fScore = { [start]: heuristicEstimate(start, goal) };
    let fValues = { [start]: fScore[start] };

    while (!openSet.isEmpty()) {
        let current = openSet.dequeue();

        if (current === goal) {
            let path = reconstructPath(cameFrom, current);
            return { path, cost: gScore[goal], fValues };
        }

        // Check for direct path from current to neighbors
        for (let neighbor in graph[current]) {
            let tentative_gScore = gScore[current] + graph[current][neighbor].cost;

            // If the new gScore is better, update the values
            if (tentative_gScore < (gScore[neighbor] || Infinity)) {
                cameFrom[neighbor] = current;
                gScore[neighbor] = tentative_gScore;
                fScore[neighbor] = gScore[neighbor] + heuristicEstimate(neighbor, goal);
                openSet.enqueue(neighbor, fScore[neighbor]);
                fValues[neighbor] = fScore[neighbor];  // Store the f(n) value for the neighbor
            }
        }
    }

    return { path: [], cost: Infinity, fValues: {} };
}







function heuristicEstimate(node, goal) {
    // If a heuristic value exists, return it, otherwise return Infinity
    return graph[node] && graph[node][goal] ? graph[node][goal].heuristic : Infinity;
}

function reconstructPath(cameFrom, current) {
    let path = [current];
    while (cameFrom[current]) {
        current = cameFrom[current];
        path.unshift(current);
    }
    return path;
}

function displayPath(path, fValues, goal) {  // Add goal as a parameter
    let totalFn = 0;
    let pathText = `Final A* path: ${path.join(" -> ")}\n`;

    // Calculate the total f(n) for the path
    for (let i = 0; i < path.length - 1; i++) {
        let currentNode = path[i];
        let nextNode = path[i + 1];

        // Calculate f(n) for each node and accumulate it
        let gCost = graph[currentNode][nextNode].cost;
        let hCost = graph[nextNode] ? graph[nextNode][goal]?.heuristic || 0 : 0;  // Use goal here
        let fn = gCost + hCost;

        totalFn += fn;

        pathText += `f(${currentNode} -> ${nextNode}) = ${gCost} + ${hCost} = ${fn}\n`;
    }

    pathText +=` Total f(n) for path: ${totalFn}`;
    document.getElementById("pathOutput").innerText = pathText;
}