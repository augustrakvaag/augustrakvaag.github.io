class Player {
    name: string
    buyIn: number
    chips: number
    net: number
    constructor(name: string, buyIn: number, chips: number) {
        this.name = name;
        this.buyIn = buyIn;
        this.chips = chips;
        this.net = chips-buyIn;
    }
}

class Payment {
    payer: Player
    payee: Player
    amount: number
    constructor(payer: Player, payee: Player, amount: number) {
        this.payer = payer;
        this.payee = payee;
        this.amount = amount;
    }

    toString() {
        return this.payer.name + " pays " + this.payee.name + " " + this.amount;
    }
}

let currentPlayers = 2;

let submitEl = document.querySelector("#submit");
let addPlayerEl = document.querySelector("#addPlayer");
let removePlayerEl = document.querySelector("#removePlayer");
let fieldsEl = document.querySelector("#fields");
let errorsEl = document.querySelector("#errors");
let paymentsEl = document.querySelector("#payments")

addPlayerEl!.addEventListener("click", addPlayer);
removePlayerEl!.addEventListener("click", removePlayer);
submitEl!.addEventListener("click", submit);

function addPlayer() {
    clearText();
    if (currentPlayers >= 50) {
        errorsEl!.textContent = "You can have maximum 50 players";
        return;
    }
    currentPlayers += 1;
    let newDiv = document.createElement("div");
    newDiv.id = "player" + currentPlayers;
    newDiv.className = "inputdiv";

    let nameInput = document.createElement("input");
    nameInput.id = "name" + currentPlayers;
    nameInput.placeholder = "Name...";
    newDiv.append(nameInput);

    let buyInInput = document.createElement("input");
    buyInInput.id = "buyIn" + currentPlayers;
    buyInInput.placeholder = "Bought in for...";
    newDiv.append(buyInInput);

    let chipsInput = document.createElement("input");
    chipsInput.id = "chips" + currentPlayers;
    chipsInput.placeholder = "Chips at end of game...";
    newDiv.append(chipsInput);

    fieldsEl!.append(newDiv);
}

function removePlayer() {
    clearText();
    if (currentPlayers <= 2) {
        errorsEl!.textContent = "You must have at least 2 players";
        return;
    }
    let playerDiv = document.querySelector("#player" + currentPlayers);
    playerDiv!.remove();
    currentPlayers -= 1;
}

function submit() {
    clearText();
    if (!validateInput()) {
        errorsEl!.textContent = "Buy in amount does not match chip amount. Count again."
        return
    }
    let players: Player[] = [];
    for(let i=1; i<currentPlayers+1; i++) {
        let name = document.querySelector<HTMLInputElement>("#name" + i)!.value;
        let buyIn = Number(document.querySelector<HTMLInputElement>("#buyIn" + i)?.value);
        let chips = Number(document.querySelector<HTMLInputElement>("#chips" + i)?.value);
        let player = new Player(name, buyIn, chips);
        players.push(player);
    }
    let payments = settle(players);
    paymentsEl!.textContent = payments;

}

function validateInput() {
    let buyInSum = 0
    let chipSum = 0
    for(let i=1; i<currentPlayers+1; i++) {
        buyInSum += Number(document.querySelector<HTMLInputElement>("#buyIn" + i)?.value);
        chipSum += Number(document.querySelector<HTMLInputElement>("#chips" + i)?.value);
    }
    if (buyInSum == chipSum) {
        return true;
    }
    else {
        return false;
    }
}

function clearText() {
    paymentsEl!.textContent = "";
    errorsEl!.textContent = "";
}

function createSubsets(playerList: Player[]) {
    let subsets = []
    let nPlayers = playerList.length
    let nSubsets = 2**nPlayers;

    for(let i=1; i<nSubsets; i++) {
        let subset = []
        let binary = i.toString(2).padStart(nPlayers,"0");
        for(let j=0; j<binary.length; j++){
            if(binary[j] == "1"){
                subset.push(playerList[j]);
            }
        }
        subsets.push(subset);
    }
    return(subsets);
}

function iterateSubsets(subsetList: Player[][]) {
    let zeroSumSubsets = [];
    for(let i=0; i<subsetList.length; i++){
        let subset = subsetList[i];
        let subsetSum = 0
        for(let j=0; j<subset.length; j++){
            subsetSum += subset[j].net;
        }
        if(subsetSum==0){
            zeroSumSubsets.push(subset);
        }
    }
    return zeroSumSubsets;
}

function chooseSubsets(zeroSumSubsets: Player[][]) {
    let bestCount = 0;
    let bestSelection: Player[][] = [];

    function search(index: number, usedPlayers: Set<string>, current: Player[][]) {
        if (index === zeroSumSubsets.length) {
            if (current.length > bestCount) {
                bestCount = current.length;
                bestSelection = [...current];
            }
            return;
        }

        const subset = zeroSumSubsets[index];

        if (!subset.some(p => usedPlayers.has(p.name))) {
            const newUsed = new Set([...usedPlayers, ...subset.map(p => p.name)]);
            search(index + 1, newUsed, [...current, subset]);
        }

        search(index + 1, usedPlayers, current);
    }

    search(0, new Set(), []);
    return bestSelection;
}

function splitPlayers(playerList: Player[]) {
    const payers = playerList.filter(p => p.net < 0);
    const payees = playerList.filter(p => p.net > 0);
    return [payers, payees];
}

function playerSort(playerList: Player[]) {
    return [...playerList].sort((a, b) => Math.abs(a.net) - Math.abs(b.net)).reverse();
}

function settleGroup(playerList: Player[]) {
    let payments = [];
    let [payers, payees] = splitPlayers(playerList);
    payers = playerSort(payers);
    payees = playerSort(payees);

    for(let i=0; i<payees.length; i++) {
        if (payees[i].net == 0) continue;
        else {
            for(let j=0; j<payers.length; j++) {
                if (payers[j].net == 0) continue;
                else {
                    if (payees[i].net >= -payers[j].net) {
                        payments.push(new Payment(payers[j], payees[i], -payers[j].net));
                        payees[i].net = payees[i].net + payers[j].net;
                        payers[j].net = 0;
                    }
                    else if (payees[i].net < -payers[j].net) {
                        payments.push(new Payment(payers[j], payees[i], payees[i].net));
                        payers[j].net = payers[j].net + payees[i].net;
                        payees[i].net = 0;
                        break;
                    }
                }
            }
        }
    }

    return payments;
}

function settle(playerList: Player[]) {
    let allPlayerSubsets = createSubsets(playerList);
    let zeroSumSubsets = iterateSubsets(allPlayerSubsets);
    let optimalSubsets = chooseSubsets(zeroSumSubsets);

    let payments: Payment[] = [];
    payments.push(...optimalSubsets.map((a) => settleGroup(a)).flat());
    let paymentsText = payments.map((a) => a.toString()).join("<br>");
    return paymentsText;
}