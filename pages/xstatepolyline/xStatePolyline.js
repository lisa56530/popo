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
        /** @xstate-layout N4IgpgJg5mDOIC5QAcD2AbAngGQJYDswA6XCdMAYgFlUBXWMAYXVwGMBrAbQAYBdRFKli4ALrlT4BIAB6IAtACYiC7gA4AzKu4KFATm7cA7KtUA2ACwAaEJkQBGAKymijw+btG9dj+cMBfP2s0LDxCIgBVfAAFVAIRajoGGgA3MB5+JBA0YTEJKVkEOUcHIm51QwtHXwcHBVUFa1sEO11nNwc7Q3VWh3U7U36AoIwcAmJImLiKACEAQw4AZWR5tL4pbNFxSUyCx24XBV6PDQG3dQabRDqlcwVTOvu9U107dSGskdDx6Nj8eJp6EwWBx0ushJs8jt5ApzER1OVnuYBvCKqpdI1EOoHKoiOZVHZbuYHLotDpTO9gqMwlF0PRcGBaAAnWCTP6wCgAUVgrFmyFWGUEOS2+XkRzhunM5gM6lu53KGIQfX2rQUmm4nVM3FMHQpnzGRBpdIZzNZInZAKSqFSoMyG1y21ABUUWpc7kMLW42J8VkuCAcnqIhheh3qui6xMcupC+sNwmNLN+Zpm83YSxWNsFEIdMns9SIvW0xi0MvcdlUCv9JSDdj03QUhi6mijVOIsfpTITcXZHL+YEZGY+QshjvkUvURAlpjRxylpk1hgVSon9zVGq1OsCH2jYQmic53N5-LBQ+zTrq496MJRjhaNQXvoUNZcqndDax91qDmbXwiPymPZEPsBztYUoUKc9A1eOd7klXR1CnUwFRrEoyhUBszkRGtvxjWk4w7U1zUSIE2C4NZbXBe0RXA2EUXdPoBk9DwsQrKUJyDJEYTgtRyXefBUAgOAwW3MBjyzKi5AcINxUlaVZVVe8mjkXR810bFVEkzRXklW5sLCUhyFEyiwOU+CylMdQjHxOoJQcBUG0DbhS3qLE6mxL9N0pH9dziQzQJHQon1RCUg3rWoSWxRdHKIdTXhrO54OMcxdNbWZYAAETAU1fOHHMEDuQwXBlbQagMVVbiQiVSjUu5TDcJEkWSg1cPbE1E3gciT3E+DcXMbpbmebFtV0C4miREoNG6GpNPMXQ4MamIsBYQhstPeRAqnOCBgm4qdAVOccUMSTHwcJEJQ8dyAiAA */
        id: "polyLine",

        states : {
            idle: {},

            UnPoint: {
                on: {
                    MouseMove: {
                        target: "UnPoint",
                        internal: true,
                        actions: "setLastPoint"
                    },

                    BackSpace: {
                        target: "PasDePoint",
                        actions: "removeLastPoint"
                    },

                    Escape: {
                        target: "idle",
                        actions: "abandon"
                    }
                }
            },

            PasDePoint: {},

            PlusieursPoints: {
                on: {
                    Escape: {
                        target: "idle",
                        actions: "abandon"
                    },

                    MouseMove: {
                        target: "PlusieursPoints",
                        internal: true,
                        actions: "setLastPoint"
                    },

                    BackSpace: {
                        target: "PlusieursPoints",
                        internal: true,
                        actions: "removeLastPoint"
                    },

                    Enter: {
                        target: "idle",
                        actions: ["saveLine", "addPoint"],
                        cond: "New Guard"
                    },
                    MouseClick: {
                        target: "Polyline",
                        actions: "createLine"
                    }
                }
            },

            Polyline: {}
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
