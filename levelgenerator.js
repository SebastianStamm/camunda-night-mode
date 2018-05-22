export function dijkstra(graph, start) {
  const unvisited = new Set();
  const dist = {};
  const prev = {};

  Object.keys(graph).forEach(node => {
    dist[node] = Infinity;
    prev[node] = undefined;
    unvisited.add(node);
  });

  dist[start] = 0;

  const getNodeWithMinDist = () => {
    let currentMin = Infinity;
    let currentNode = undefined;
    unvisited.forEach(node => {
      if (dist[node] < currentMin) {
        currentMin = dist[node];
        currentNode = node;
      }
    });

    return currentNode;
  };

  while (unvisited.size) {
    const u = getNodeWithMinDist();

    if (!u) {
      break;
    }
    unvisited.delete(u);

    graph[u].forEach(v => {
      const alt = dist[u] + 1;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    });
  }

  return { dist, prev };
}

export function getNodeFurthestAwayFrom(graph, ...nodes) {
  const dist = nodes.map(node => dijkstra(graph, node).dist);

  let currentMax = -Infinity;
  let currentNode = undefined;
  let currentDiff = Infinity;
  Object.keys(graph).forEach(node => {
    const d = dist.reduce((acc, curr) => acc + curr[node], 0);
    const dists = dist.map(e => e[node]);
    const spread = Math.max(...dists) - Math.min(...dists);
    if (
      d !== Infinity &&
      (d > currentMax || (d === currentMax && spread < currentDiff))
    ) {
      currentMax = d;
      currentNode = node;
      currentDiff = spread;
    }
  });

  return currentNode;
}

export function removeNodeFromGraph(graph, nodeToRemove) {
  const newGraph = {};

  Object.keys(graph).forEach(node => {
    if (node !== nodeToRemove) {
      newGraph[node] = graph[node].filter(node => node !== nodeToRemove);
    }
  });

  return newGraph;
}

export function isNodeReachable(graph, start, node) {
  return !!dijkstra(graph, start).prev[node];
}
