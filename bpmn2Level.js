import "./bpmn-viewer.development.js";
import {
  getNodeFurthestAwayFrom,
  removeNodeFromGraph,
  isNodeReachable,
  dijkstra
} from "./levelgenerator.js";

import * as canvasProcessing from "./canvasProcessing.js";

const scaleFactor = 0.15;

(async () => {
  const xml = await (await fetch("./bat.bpmn")).text();
  const viewer = new BpmnJS();
  viewer.importXML(xml, () => {
    const { min, max } = (reg => {
      const min = { x: Infinity, y: Infinity };
      const max = { x: -Infinity, y: -Infinity };
      reg.forEach(elem => {
        if (
          elem.type !== "label" &&
          elem.businessObject.$instanceOf("bpmn:FlowNode")
        ) {
          min.x = Math.min(min.x, elem.x);
          min.y = Math.min(min.y, elem.y);
          max.x = Math.max(max.x, elem.x + elem.width);
          max.y = Math.max(max.y, elem.y + elem.height);
        }
      });
      return { min, max };
    })(viewer.get("elementRegistry"));

    const offset = {
      x: -min.x + 1 / scaleFactor,
      y: -min.y + 1 / scaleFactor
    };

    const dimensions = {
      x: (max.x - min.x + 3 / scaleFactor) * scaleFactor,
      y: (max.y - min.y + 3 / scaleFactor) * scaleFactor
    };

    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", dimensions.x);
    canvas.setAttribute("height", dimensions.y);

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, dimensions.x, dimensions.y);

    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;

    viewer.get("elementRegistry").forEach(elem => {
      if (
        elem.type !== "label" &&
        elem.businessObject.$instanceOf("bpmn:FlowNode")
      ) {
        ctx.fillRect(
          (elem.x + offset.x) * scaleFactor,
          (elem.y + offset.y) * scaleFactor,
          elem.width * scaleFactor,
          elem.height * scaleFactor
        );
      }
      if (
        elem.type !== "label" &&
        elem.businessObject.$instanceOf("bpmn:SequenceFlow")
      ) {
        ctx.moveTo(
          (elem.waypoints[0].x + offset.x) * scaleFactor,
          (elem.waypoints[0].y + offset.y) * scaleFactor
        );
        elem.waypoints.slice(1).forEach(({ x, y }) => {
          ctx.lineTo(
            (x + offset.x) * scaleFactor,
            (y + offset.y) * scaleFactor
          );
        });
        ctx.stroke();
      }
    });

    canvasProcessing.applyThresholds(canvas);
    canvasProcessing.removeUnneededEntities(canvas);

    document.body.appendChild(canvas);

    // convert bpmn to graph
    const nodes = viewer
      .get("elementRegistry")
      .filter(
        e =>
          e.type !== "label" &&
          e.businessObject &&
          e.businessObject.$instanceOf("bpmn:FlowNode")
      );

    const graph = {};
    nodes.forEach(node => {
      graph[node.id] = [];
      node.businessObject.incoming &&
        node.businessObject.incoming.forEach(sf => {
          graph[node.id].push(sf.sourceRef.id);
        });
      node.businessObject.outgoing &&
        node.businessObject.outgoing.forEach(sf => {
          graph[node.id].push(sf.targetRef.id);
        });
    });

    const start = nodes.find(e =>
      e.businessObject.$instanceOf("bpmn:StartEvent")
    ).id;
    const { dist } = dijkstra(graph, start);

    const goal = nodes
      .filter(e => e.businessObject.$instanceOf("bpmn:EndEvent"))
      .map(node => [node.id, dist[node.id]])
      .sort((a, b) => b[1] - a[1])[0][0];

    let subGoal = goal;
    let subGraph = graph;

    const keyLocations = {};

    let i = 0;
    while (isNodeReachable(subGraph, start, subGoal) && i < 100) {
      const keyRoom = getNodeFurthestAwayFrom(subGraph, start, subGoal);
      subGraph = removeNodeFromGraph(subGraph, subGoal);

      keyLocations[subGoal] = keyRoom;

      subGoal = keyRoom;
      i++;
    }
    console.log("player should go from", start, "to", goal);
    console.log(keyLocations, graph);
  });
})();
