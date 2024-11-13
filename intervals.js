let startButtonEl = document.querySelector("#startButton");
let startIntervalEl = document.querySelector("#startInterval");
let chooseEl = document.querySelector("#choose");
let selectEl = document.querySelector("#select")

let intervals = {};
let intervalList = [];

chooseEl.addEventListener("click", getInterval)
startButtonEl.addEventListener("click", startInterval);
getAllIntervals();

async function getInterval() {
    let chooseIntervalEl = document.querySelector("#chooseInterval")
    chooseIntervalEl.style.display = "none";
    startButtonEl.style.display = "flex";
    startIntervalEl.style.display = "flex";
    let chosenInterval = selectEl.value;
    intervalList = intervals[chosenInterval].map((intervalAndTitle) => {
        return [intervalAndTitle["time"], intervalAndTitle["power"]];
    })
    let titleEl = document.querySelector("#title");
    titleEl.textContent = selectEl.value;
}

async function getAllIntervals() {
    fetch("https://gist.githubusercontent.com/augustrakvaag/b2a0bad0b826a77407f4a43983adbd2f/raw/")
        .then(response => response.json())
        .then(data => {
            intervals = data;
            let selectEl = document.querySelector("#select");
            Object.keys(intervals)
            .sort()
            .forEach(key => {
                let op = document.createElement("option");
                op.value = key;
                op.textContent = key;
                selectEl.appendChild(op);
            });
        })
        .then(() => {
            console.log("Intervals loaded");
        });
}

async function startInterval() {
    startIntervalEl.style.display = "none"; //Hides the start button
    let intervalDivEl = document.querySelector("#interval");
    intervalDivEl.style.display = "flex"; //Makes the main interval screen visible
    createTable(intervalList);
    main(intervalList);
}

async function main(array) {
    let powerEl = document.querySelector("#power");
    for (let i = 0; i < array.length; i++) {
        powerEl.textContent = array[i][1]; //Sets target power
        let currentArrow = document.querySelector("#t" + i);
        currentArrow.textContent = "◄"; //Moves the arrow indicating where in the session you are
        await countdown(array[i][0]);
        currentArrow.textContent = "";
    }
}

function countdown(start) {
    let timeEl = document.querySelector("#time");
    return new Promise((resolve) => { //Due to async behaviour in the main function, countdown has to return a promise
        let currentCount = start;
        const interval = setInterval(() => {
            timeEl.textContent = timeFormat(currentCount);
            currentCount--;
            if (currentCount < 0) {
                clearInterval(interval);
                resolve();
            }
        }, 1000); // 1000 milliseconds = 1 second
    });
}

function createTable(array) {
    let tableEl = document.querySelector("#table");
    if (array.length > 11) {
        let tableDivEl = document.querySelector("#tableDiv");
        tableDivEl.style.fontSize = "2rem";
    }
    tableEl.innerHTML = "";
    let tbodyEl = document.createElement("tbody");
    for (let i = 0; i < array.length; i++) {
        let trEl = document.createElement("tr");
        let tdEl = document.createElement("td");
        tdEl.textContent = timeFormat(array[i][0]) + " @ " + array[i][1];
        if (i % 2 == 0) {
            tdEl.classList.add("even");
        }
        trEl.appendChild(tdEl);
        tdEl = document.createElement("td");
        tdEl.id = "t" + i.toString(); //id will be used to move arrow downward
        trEl.appendChild(tdEl);
        tbodyEl.appendChild(trEl);
    }
    tableEl.appendChild(tbodyEl);
}

function timeFormat(seconds) {
    min = Math.floor(seconds / 60);
    sec = seconds % 60;
    return min + ":" + sec.toString().padStart(2, "0");
}