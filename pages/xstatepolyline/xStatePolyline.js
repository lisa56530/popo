import Konva from "konva";
import { createMachine, interpret } from "xstate";


const stage = new Konva.Stage({
    container: "container",
    width: 400,
    height: 400,
});

const layer = new Konva.Layer();
stage.add(layer);

const MAX_POINTS = 10;
let polyline // La polyline en cours de construction;

const polylineMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QAcD2AbAngGQJYDswA6XCdMAYgFlUBXWMAYXVwGMBrAbQAYBdRFKli4ALrlT4BIAB6IAtACYALEQDMqgOwaAjAA4ArPt0A2bgE5d2-QBoQmRAsdFdqhTuNmz+jfrNL9AL4BtmhYeIREAKr4AAqoBCLUdAw0AG5gPPxIIGjCYhJSsghyVgpEGqomlY7qBpW29ggK+sZE+o5mxr7txgqq3IHBORg4BMTRcQkUAEIAhhwAysjzGXxSuaLiktlF2v3OxrrcOm5Keq66DQ4tbR0mfdqO5oMhI+HjsfH4iTT0TCwcTLrISbAo7eTKNSaHQDVRmAbKbTGK4IVTGFRHJTHBRmC4DY5BV5hMZEGLoei4MC0ABOsEm31gFAAorBWLNkKssoI8ltCvJVNptERlNxlJ1fNoKqoUf0hdxDq5mli4ZVjIThsSImSKVTafSRIzfilUOkgdkNvltqAiiUFK0zodtGc0dxdBpOij9JKDoZjroFNxuEp3erQqMteThLq6V8DTN5uwliszdzQVaZA5zER4W4XGY9vnDsi7IglLjnEpjBoPC4NLoDNpQ28SdqozSYwlGUzvmBqSnhjywdaIQGiNijK73f6ugoZdw5Qr+pZHkHmkEhvhUBA4MDNWBgYP0zbVL5hVixV181KUaZbsugxpuJVq0om3uSGR9+aQZa+cVHuUhx+O6bjtBYRgok6GjOAoy5GL0-g4m+4YfPqB5pn+tqAbowFmKBOIGJcJaooGRDGAq+gDH4LhKLoyHvKSsywAAImAaHfoef52tBeznr6oqqEos7EdofhjkY05VkolaVvRLaRpS7b6vAHEYeCxRokQ0lwvBChWGclYokoApqJWFS0fKuJHGq65AA */
        id: "polyLine",

        states : {
            idle: {},

            UnPoint: {
                on: {
                    MouseMove: {
                        target: "UnPoint",
                        internal: true
                    },

                    BackSpace: "PasDePoint"
                }
            },

            PasDePoint: {},

            PlusieursPoints: {
                on: {
                    Escape: "idle",

                    MouseMove: {
                        target: "PlusieursPoints",
                        internal: true
                    },

                    BackSpace: {
                        target: "PlusieursPoints",
                        internal: true
                    },

                    Enter: "idle"
                }
            }
        }
    },
    // Quelques actions et guardes que vous pouvez utiliser dans votre machine
    {
        actions: {
            // Créer une nouvelle polyline
            createLine: (context, event) => {
                const pos = stage.getPointerPosition();
                polyline = new Konva.Line({
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: "red",
                    strokeWidth: 2,
                });
                layer.add(polyline);
            },
            // Mettre à jour le dernier point (provisoire) de la polyline
            setLastPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;

                const newPoints = currentPoints.slice(0, size - 2); // Remove the last point
                polyline.points(newPoints.concat([pos.x, pos.y]));
                layer.batchDraw();
            },
            // Enregistrer la polyline
            saveLine: (context, event) => {
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                // Le dernier point(provisoire) ne fait pas partie de la polyline
                const newPoints = currentPoints.slice(0, size - 2);
                polyline.points(newPoints);
                layer.batchDraw();
            },
            // Ajouter un point à la polyline
            addPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const newPoints = [...currentPoints, pos.x, pos.y]; // Add the new point to the array
                polyline.points(newPoints); // Set the updated points to the line
                layer.batchDraw(); // Redraw the layer to reflect the changes
            },
            // Abandonner le tracé de la polyline
            abandon: (context, event) => {
                // Supprimer la variable polyline :
                
            },
            // Supprimer le dernier point de la polyline
            removeLastPoint: (context, event) => {
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                const provisoire = currentPoints.slice(size - 2, size); // Le point provisoire
                const oldPoints = currentPoints.slice(0, size - 4); // On enlève le dernier point enregistré
                polyline.points(oldPoints.concat(provisoire)); // Set the updated points to the line
                layer.batchDraw(); // Redraw the layer to reflect the changes
            },
        },
        guards: {
            // On peut encore ajouter un point
            pasPlein: (context, event) => {
                // Retourner vrai si la polyline a moins de 10 points
                // attention : dans le tableau de points, chaque point est représenté par 2 valeurs (coordonnées x et y)
                
            },
            // On peut enlever un point
            plusDeDeuxPoints: (context, event) => {
                // Deux coordonnées pour chaque point, plus le point provisoire
                return polyline.points().length > 6;
            },
        },
    }
);

// On démarre la machine
const polylineService = interpret(polylineMachine)
    .onTransition((state) => {
        console.log("Current state:", state.value);
    })
    .start();
// On envoie les événements à la machine
stage.on("click", () => {
    polylineService.send("MOUSECLICK");
});

stage.on("mousemove", () => {
    polylineService.send("MOUSEMOVE");
});

// Envoi des touches clavier à la machine
window.addEventListener("keydown", (event) => {
    console.log("Key pressed:", event.key);
    // Enverra "a", "b", "c", "Escape", "Backspace", "Enter"... à la machine
    polylineService.send(event.key);
});
