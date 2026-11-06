import Konva from "konva";
import { setup, createActor } from "xstate";

const stage = new Konva.Stage({
    container: "container",
    width: 400,
    height: 400,
});

const layer = new Konva.Layer();
stage.add(layer);

const MAX_POINTS = 10;
let polyline;

const polylineMachine = setup({
    actions: {
        createLine: () => {
            const pos = stage.getPointerPosition();
            polyline = new Konva.Line({
                points: [pos.x, pos.y, pos.x, pos.y],
                stroke: "red",
                strokeWidth: 2,
            });
            layer.add(polyline);
        },
        setLastPoint: () => {
            const pos = stage.getPointerPosition();
            const currentPoints = polyline.points();
            const size = currentPoints.length;

            const newPoints = currentPoints.slice(0, size - 2);
            polyline.points(newPoints.concat([pos.x, pos.y]));
            layer.batchDraw();
        },
        saveLine: () => {
            const currentPoints = polyline.points();
            const size = currentPoints.length;
            const newPoints = currentPoints.slice(0, size - 2);
            polyline.points(newPoints);
            layer.batchDraw();
        },
        addPoint: () => {
            const pos = stage.getPointerPosition();
            const currentPoints = polyline.points();
            const newPoints = [...currentPoints, pos.x, pos.y];
            polyline.points(newPoints);
            layer.batchDraw();
        },
        abandon: () => {
            if (polyline) {
                polyline.remove();
                polyline = undefined;
                layer.batchDraw();
            }
        },
        removeLastPoint: () => {
            const currentPoints = polyline.points();
            const size = currentPoints.length;
            const provisoire = currentPoints.slice(size - 2, size);
            const oldPoints = currentPoints.slice(0, size - 4);
            polyline.points(oldPoints.concat(provisoire));
            layer.batchDraw();
        },
    },
    guards: {
        pasPlein: () => {
            return polyline.points().length / 2 < MAX_POINTS + 1;
        },
        plusDeDeuxPoints: () => {
            return polyline.points().length >= 6;
        },
    },
}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAcD2AbAngGQJYDswA6XCdMAYgFkB5AVQGUBRAYWwEkWBpAbQAYAuohSpYuAC65U+YSAAeiACx8AnEQCMAdgCsfPgCZNADnVGVBgDQhMidQDY1dvXy0rjdxdsUBfb1bRYeIREEABOAIYA7gRQ1PTMtABqTPxCSCBoYpLSsgoI6gZEAMx2Rjr6RnZF5opFRVY2CIb6RM4ufNrabtpGPn4ZGDgExGFRMXGMrBzcqbKZElIy6XlORPq6esq9ZR4qig22mnZEdhsdqt3aRb7+g0EjEdH4sQBC4QDGANawyB9gs+l5tklqA8ooWm1IW11PtrIgTGsVEikVVuvp9DcBoFhiFHuMmPhxGBQgCRFlFrlEEV9I59IpkXwygYXAcECU+MVnBUzJVtPZMQEhsFRk9YkxYO9wsh-oI5qIFjlllSaSc6QymfoWXCmh4iCoNvoirVKoojNpfP18KgIHA5djCHLyYrQYgALTaPXIr3eyqs112AV3HGkciOhUg+SIbSadREbRqpFmvZ8RSwxo0jlFHQuaN2ZqGvq3e0PMbPMPAyn5fSx6vrFOaZTGdT1bVZlpFDb2FxuOzqc0WoA */
    id: "polyLine",
    initial: "idle",
    states: {
        idle: {
            on: {
                MOUSECLICK: {
                    target: "drawing",
                    actions: ["createLine"],
                },
            },
        },
        drawing: {
            on: {
                MOUSEMOVE: {
                    actions: ["setLastPoint"],
                },
                MOUSECLICK: {
                    guard: "pasPlein",
                    actions: ["addPoint"],
                },
                Backspace: {
                    guard: "plusDeDeuxPoints",
                    actions: ["removeLastPoint"],
                },
                Enter: {
                    guard: "plusDeDeuxPoints",
                    target: "idle",
                    actions: ["saveLine"],
                },
                Escape: {
                    target: "idle",
                    actions: ["abandon"],
                },
            },
        },
    },
});

const polylineActor = createActor(polylineMachine);
polylineActor.subscribe((snapshot) => {
    console.log("Current state:", snapshot.value);
});
polylineActor.start();

stage.on("click", () => {
    polylineActor.send({ type: "MOUSECLICK" });
});

stage.on("mousemove", () => {
    polylineActor.send({ type: "MOUSEMOVE" });
});

window.addEventListener("keydown", (event) => {
    polylineActor.send({ type: event.key });
});