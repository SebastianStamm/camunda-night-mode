import "./bpmn-viewer.development.js";
import {
  getNodeFurthestAwayFrom,
  removeNodeFromGraph,
  isNodeReachable,
  dijkstra
} from "./levelgenerator.js";

import renderer from "./renderer.js";

import * as canvasProcessing from "./canvasProcessing.js";

const scaleFactor = 0.2;

window.enterNightMode = xml => {
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

        if(elem.type === 'bpmn:SequenceFlow') {
          const minX = Math.min(...elem.waypoints.map(({x}) => x));
          const maxX = Math.max(...elem.waypoints.map(({x}) => x));
          const minY = Math.min(...elem.waypoints.map(({y}) => y));
          const maxY = Math.max(...elem.waypoints.map(({y}) => y));

          min.x = Math.min(min.x, minX - 8);
          min.y = Math.min(min.y, minY - 8);
          max.x = Math.max(max.x, maxX - 8);
          max.y = Math.max(max.y, maxY - 8);
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
    canvas.setAttribute("style", "position: fixed; z-index: 999; transform: scale(5); transform-origin: 0 0; image-rendering: pixelated;");

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, dimensions.x, dimensions.y);

    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    viewer.get("elementRegistry").forEach(elem => {
      if (
        elem.type !== "label" &&
        elem.businessObject.$instanceOf("bpmn:FlowNode")
      ) {
        ctx.fillRect(
          Math.round((elem.x + offset.x) * scaleFactor),
          Math.round((elem.y + offset.y) * scaleFactor),
          Math.round(elem.width * scaleFactor),
          Math.round(elem.height * scaleFactor)
        );
      }
      if (
        elem.type !== "label" &&
        elem.businessObject.$instanceOf("bpmn:SequenceFlow")
      ) {
        ctx.beginPath();
        ctx.moveTo(
          Math.round((elem.waypoints[0].x + offset.x) * scaleFactor),
          Math.round((elem.waypoints[0].y + offset.y) * scaleFactor)
        );
        elem.waypoints.slice(1).forEach(({ x, y }) => {
          ctx.lineTo(
            Math.round((x + offset.x) * scaleFactor),
            Math.round((y + offset.y) * scaleFactor)
          );
        });
        ctx.stroke();
      }
    });

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

    const startNode = nodes.find(e =>
      e.businessObject.$instanceOf("bpmn:StartEvent")
    );
    const start = startNode.id;

    const { dist } = dijkstra(graph, start);

    const goalNode = nodes
      .filter(e => e.businessObject.$instanceOf("bpmn:EndEvent"))
      .map(node => [node, dist[node.id]])
      .sort((a, b) => b[1] - a[1])[0][0];

    const goal = goalNode.id;
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

    // block all entries to nodes with access requirements
    Object.keys(keyLocations).forEach((node, idx) => {
      keyLocations[node] = {
        unlockLocation: keyLocations[node],
        blockedColor: idx + 1
      };

      const elem = viewer.get("elementRegistry").get(node);

      elem.incoming.filter(({type}) => type === 'bpmn:SequenceFlow').forEach(elem => {
        const start = {
          x:
            (elem.waypoints[elem.waypoints.length - 1].x + offset.x) *
            scaleFactor,
          y:
            (elem.waypoints[elem.waypoints.length - 1].y + offset.y) *
            scaleFactor
        };
        const vector = new THREE.Vector2(
          (elem.waypoints[elem.waypoints.length - 2].x + offset.x) *
            scaleFactor -
            (elem.waypoints[elem.waypoints.length - 1].x + offset.x) *
              scaleFactor,
          (elem.waypoints[elem.waypoints.length - 2].y + offset.y) *
            scaleFactor -
            (elem.waypoints[elem.waypoints.length - 1].y + offset.y) *
              scaleFactor
        );

        vector.normalize();

        ctx.beginPath();
        ctx.moveTo(Math.round(start.x), Math.round(start.y));
        elem.waypoints.slice(1).forEach(({ x, y }) => {
          ctx.lineTo(
            Math.round(start.x + vector.x),
            Math.round(start.y + vector.y)
          );
        });
        ctx.strokeStyle = "rgba(" + (idx + 1) + ", 0, 0, 1)";
        ctx.stroke();
      });
      elem.outgoing.filter(({type}) => type === 'bpmn:SequenceFlow').forEach(elem => {
        const start = {
          x: (elem.waypoints[0].x + offset.x) * scaleFactor,
          y: (elem.waypoints[0].y + offset.y) * scaleFactor
        };
        const vector = new THREE.Vector2(
          (elem.waypoints[1].x + offset.x) * scaleFactor -
            (elem.waypoints[0].x + offset.x) * scaleFactor,
          (elem.waypoints[1].y + offset.y) * scaleFactor -
            (elem.waypoints[0].y + offset.y) * scaleFactor
        );

        vector.normalize();

        ctx.beginPath();
        ctx.moveTo(Math.round(start.x), Math.round(start.y));
        elem.waypoints.slice(1).forEach(({ x, y }) => {
          ctx.lineTo(
            Math.round(start.x + vector.x),
            Math.round(start.y + vector.y)
          );
        });
        ctx.strokeStyle = "rgba(" + (idx + 1) + ", 0, 0, 1)";
        ctx.stroke();
      });

      const unlockElem = viewer
        .get("elementRegistry")
        .get(keyLocations[node].unlockLocation);

      const unlocker = ctx.createImageData(1, 1);
      unlocker.data[0] = 255;
      unlocker.data[1] = 1;
      unlocker.data[2] = idx + 1;
      unlocker.data[3] = 255;

      ctx.putImageData(
        unlocker,
        Math.round(
          (unlockElem.x + offset.x + unlockElem.width / 2) * scaleFactor
        ),
        Math.round(
          (unlockElem.y + offset.y + unlockElem.height / 2) * scaleFactor
        )
      );
    });

    const startPosition = {
      x: (startNode.x + offset.x + startNode.width / 2) * scaleFactor,
      y: (startNode.y + offset.y + startNode.height / 2) * scaleFactor
    };

    canvasProcessing.removeUnneededEntities(canvas);

    renderer.init(canvas, startPosition);
  });
};
