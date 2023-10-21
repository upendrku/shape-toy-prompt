const canvas = document.querySelector("canvas"),
    toolBtns = document.querySelectorAll(".tool"),
    fillColor = document.querySelector("#fill-color"),
    widthSlider = document.querySelector("#width-slider"),
    heightSlider = document.querySelector("#height-slider"),
    radiusSlider = document.querySelector("#radius-slider"),
    colorBtns = document.querySelectorAll(".colors .option"),
    colorPicker = document.querySelector("#color-picker"),
    optionsSec = document.querySelector("#options-section"),
    rectOptions = document.querySelector("#rect-options"),
    circleOptions = document.querySelector("#circle-options"),
    ctx = canvas.getContext("2d");

// global variables with default value
let prevMouseX, prevMouseY, snapshot,
    isDrawing = false,
    selectedTool = "",
    rectWidth = 50,
    rectHeight = 50,
    circleRadius = 50,
    selectedColor = "#000",
    shapes = [],
    selectedShapes = [];

const setCanvasBackground = () => {
    // setting whole canvas background to white, so the downloaded img background will be white
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor; // setting fillstyle back to the selectedColor, it'll be the brush color
}

window.addEventListener("load", () => {
    // setting canvas width/height.. offsetwidth/height returns viewable width/height of an element
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
});

const drawRect = (e) => {
    shapes.push({ x: e.offsetX, y: e.offsetY, width: rectWidth, height: rectHeight, isSelected: false, type: "reactangle" })
    // if fillColor isn't checked draw a rect with border else draw rect with background
    if (!fillColor.checked) {
        // creating Rectangle according to selected width and height
        return ctx.strokeRect(e.offsetX, e.offsetY, rectWidth, rectHeight);
    }
    ctx.fillRect(e.offsetX, e.offsetY, rectWidth, rectHeight);
}

const drawCircle = (e) => {
    ctx.beginPath(); // creating new path to draw circle
    // getting radius for circle according to the selected radius
    ctx.arc(prevMouseX, prevMouseY, circleRadius, 0, 2 * Math.PI); // creating circle according to the mouse pointer
    fillColor.checked ? ctx.fill() : ctx.stroke(); // if fillColor is checked fill circle else draw border circle
    shapes.push({ x: prevMouseX, y: prevMouseY, width: circleRadius, height: circleRadius, isSelected: false, type: "circle" })
}

const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX; // passing current mouseX position as prevMouseX value
    prevMouseY = e.offsetY; // passing current mouseY position as prevMouseY value
    ctx.beginPath(); // creating new path to draw
    ctx.lineWidth = 2; // passing brushSize as line width
    ctx.strokeStyle = selectedColor; // passing selectedColor as stroke style
    ctx.fillStyle = selectedColor; // passing selectedColor as fill style
    // copying canvas data & passing as snapshot value.. this avoids dragging the image
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

const drawing = (e) => {
    if (!isDrawing) return; // if isDrawing is false return from here
    ctx.putImageData(snapshot, 0, 0); // adding copied canvas data on to this canvas

    if (selectedTool === "rectangle") {
        drawRect(e);
    } else if (selectedTool === "circle") {
        drawCircle(e);
    }
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", (event) => {
        // adding click event to all tool option
        // removing active class from the previous option and adding on current clicked option
        document.querySelector(".options .active")?.classList.remove("active");
        if (selectedTool !== btn.id) {
            btn.classList.add("active");
            selectedTool = btn.id;

            if (selectedTool === "rectangle") {
                circleOptions.style.display = "none";
                optionsSec.style.visibility = "visible";
                rectOptions.style.display = "block";
            }

            if (selectedTool === "circle") {
                rectOptions.style.display = "none";
                optionsSec.style.visibility = "visible";
                circleOptions.style.display = "block";
            }
        } else {
            btn.classList.remove("active");
            selectedTool = "";
        }
    });
});

widthSlider.addEventListener("change", () => rectWidth = widthSlider.value); // passing slider value as rectangle width
heightSlider.addEventListener("change", () => rectHeight = heightSlider.value); // passing slider value as rectangle height
radiusSlider.addEventListener("change", () => circleRadius = radiusSlider.value); // passing slider value as circle radius

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => { // adding click event to all color button
        // removing selected class from the previous option and adding on current clicked option
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected");
        // passing selected btn background color as selectedColor value
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorPicker.addEventListener("change", () => {
    // passing picked color value from color picker to last color btn background
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousedown", drawing);
canvas.addEventListener("mouseup", () => isDrawing = false);

function findSelectedShape(x, y) {
    return shapes.find(shape => {
        return (
            x >= shape.x &&
            x <= shape.x + shape.width &&
            y >= shape.y &&
            y <= shape.y + shape.height
        );
    });
}
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawShapes() {
    // clearCanvas();
    for (const shape of shapes) {
        ctx.fillStyle = shape.isSelected ? 'blue' : 'black';
        if (shape.isSelected) {
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            if (shape.type === "reactangle") ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            if (shape.type === "circle") {
                ctx.arc(shape.x, shape.y, shape.width, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    }
}
canvas.addEventListener("mousedown", (e) => {

    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    const selectedShape = findSelectedShape(mouseX, mouseY);

    if (selectedShape) {
        if (e.shiftKey) {
            if (selectedShapes.includes(selectedShape)) {
                selectedShapes = selectedShapes.filter(
                    shape => shape !== selectedShape
                );
                selectedShape.isSelected = false; // Deselect the shape
            } else {
                selectedShapes.push(selectedShape);
                selectedShape.isSelected = true; // Select the shape
            }
        } else {
            selectedShapes = [selectedShape];
            for (const shape of shapes) {
                shape.isSelected = false;
            }
            selectedShape.isSelected = true; // Select the shape
        }
        isDragging = true;
    } else {
        selectedShapes = [];
    }

    isDrawing = true;
    drawShapes();
});


