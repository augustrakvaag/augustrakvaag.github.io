let dagerTekstEl = document.querySelector("#dagerTekst");
let morgenjoggTekstEl = document.querySelector("#morgenjoggTekst");
let sekunderTekstEl = document.querySelector("#sekunderTekst");

let start = 1749884400;

function calculateDifference(){
    let time = Date.now() / 1000;
    let timeLeft = start - time;
    return timeLeft;
}

function updatePage(seconds){
    let minutes = seconds/60;
    let hours = minutes/60;
    let days = hours/24;
    let weeks = days/7;

    dagerTekstEl.innerHTML = "Det er " + Math.floor(days) + " dager til Hove";
    morgenjoggTekstEl.innerHTML = Math.floor(weeks) + " morgenjogg";
    sekunderTekstEl.innerHTML = Math.floor(seconds) + " sekunder";
}

updatePage(calculateDifference())