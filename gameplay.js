// Ryan Hamilton, ISTE 442 Final

// ***************************** GLOBAL VARS **********************

var players = {},
    board = {},
    playerTurn = 1,
    maxScore = 20,
    maxPlayers = 2,
    gameID = 1,
    isRandom = true,
    playerTurnArray = [],
    rolled = false;


// ******************************* HELPER **********************************
//outputs the playerArray based off of number of dice, helper function
function outputEmptyPlayer(numDice){
    playerArray = null
    switch(numDice){
        case 2:
            playerArray = [0,0];
            break;
        case 3:
            playerArray = [0,0,0];
            break;
        case 4:
            playerArray = [0,0,0,0];
            break;
        case 6:
            playerArray = [0,0,0,0,0,0];
            break;
        default:
            return null;
    }
    return playerArray
}

/**
 * 
 * @returns the current players playerID
 */
function getCurrentPlayerID(){
    return players[getCurrentPlayerTurn()].playerID;
}



// ************************************ SETUP *************************************


//add a new card to the board
function addCardToBoard(slot, card){
    let cardSlot = 'card' + slot;

    //test if card already exists in slot
    if(!isCardslotUsed(slot) || slot > 3 || slot < 1){
        return null;
    }
    else{
        //update card to add playerArrays
        let playerArray = outputEmptyPlayer(card['valuesNeed'].length);
        
        //if non valid array is returned
        if(null){
            return null;
        }
        
        //update the card to numPlays
        for(let i = 1; i <= maxPlayers; i++){
            card['player'+i] = playerArray;
        }

        //update to the board
        board[cardSlot] = card;
    }
}



function addRandomCardToBoard(slot){
    if(!isRandom){
        return `{"error" : 'Game not in random mode'}`;
    }
    //test if numDice is valid
    let points = -1,
        playerArray,  //placeholder for where the players will place their dice
        numDice;

    //test if card already exists in slot
    if(!isCardslotUsed(slot) || slot > 3 || slot < 1){
        return null;
    }

    //randomly generate numDice using odds from game

    //6 2points, 12 5points, 8 10points, 4 15point
    //20% 2point, 40% 5 points, 27% 10 points, 13% 15 point 

    let rng = Math.floor(Math.random() * 100)

    if (rng < 20){
        points = 2;
        numDice = 2;
    }
    else if(20<=rng && rng<60){
        points = 5;
        numDice = 3;
    }
    else if(60<=rng && rng<87){
        points = 10;
        numDice = 4;
    }
    else{
        points = 15;
        numDice = 6;
    }
        
    //create random die
    let cardDice = rollNDice(numDice);

    //create the card
    let card = {
        'points'    : points,
        'valuesNeed':  cardDice,
    }

    playerArray = outputEmptyPlayer(numDice);
    //update card to numPlays
    for(let i = 1; i <= maxPlayers; i++ ){
        card['player'+i] = playerArray.slice();
    }
    
    //insert into board
    board['card'+slot] = card;

    return card; // return the card
}

//add another player to the list, prevents if maxNum is already done
function addPlayer(playerID, username, color){
    //test if maxNumPlayers exist
    if(players[maxPlayers]){

        //Reject and return 
        return null;
    }

    //test until a player is not add
    for(let i = 1; i <= maxPlayers; i++){
        let playerNum = `player` + i;
        if(!players[playerNum]){
            //insert into 
            players[playerNum] = {
                "playerID" : playerID,
                "username" : username,
                "color"    : color,
                'score'    : 0,
                'playerDice' : [0,0,0,0,0,0],
                'lockedDice' : []
            }

            //update playerDB to set gameID to

            return players[playerNum]; //return new player Object
        }
    }
}

/**
 * fills the board with 3 random cards
 * 
 */
function gameStartRandomCards(){
    if(!isRandom){
        return `{"error" : 'Game not in random mode'}`;
    }
    addRandomCardToBoard(1);
    addRandomCardToBoard(2);
    addRandomCardToBoard(3);
}

/**
 * Testing init, add 2 players and add 3 cards to board
 */
function init(){
    addPlayer(1,'wwwwwwwwwwwwwwwwwwww','purple');
    addPlayer(2,'player2','green');
    addPlayer(3,'player3','red');
    addPlayer(4,'player4','blue');


    gameStartRandomCards();

    playerRoll(1);

    //setup displays
    updateBoard();
    updateAllPlayers();

    let curPlayer = players[getCurrentPlayerTurn()];
    currentTurnDisplay(curPlayer.username, curPlayer.color);


}

// ************************** HELPER VALIDATION **************************************88

function isPlayerInGame(playerID, gameIDparam){

    //check if game is correct
    if(gameID != gameIDparam){
        return null;
    }

    let player, playerNum = -1;

    //attempts to get player objec
    for(let i = 1; i <= maxPlayers; i++){
        if(players['player' + i].playerID === playerID){
            player = players['player'+i];
            playerNum = i
        }
    }

    //returnsplayerb object and what playerNum they are
    return { 
        'playerNum': playerNum,
        "playerObj":player};
}

/**
 * Returns if the current slot has a card in it or not
 * 
 * @param {*} slotNum 
 * @returns 
 */
function isCardslotUsed(slotNum){
    return board['card'+slotNum] === undefined
}

// ************************************ ROLLING ********************************



//rollDice
function rollDie(){
    return Math.floor(6 * Math.random() ) + 1
}

function rollNDice(numDice){
    let tempStorage = [];

    for(let i = 0; i < numDice; i++){
        tempStorage[i] = rollDie();
    }

    return tempStorage;
}

//rolls the dice for a player
function playerRoll(playerID, isRollAll = false, gameIDparam = 1){
    //player obj

    let rPlayerJson = isPlayerInGame(playerID, gameIDparam) //HARD CODED 1 FOR NOW
    let playerNum = rPlayerJson.playerNum;
    //if playerID not in game, return nll
    if(playerNum === -1){
        return `{'error': 'Player not in game'}`;
    }

    //get the player obj
    let player = rPlayerJson.playerObj;

    //update roll
    rolled = true;

    //if player takesback and rolls all
    if(isRollAll){
        //iterate through all cards and remove the dice
        for(let i = 1; i <= 3; i++){
            retrieveAllDiceFromCard(playerID,gameIDparam,i);
        }

        player.lockedDice = [] //unlock all dice
        player.playerDice = rollNDice(6) // roll new dice
        
        //update display
        updatePlayer(playerNum);
        updateBoard();
        return player.playerDice
    }

    //else roll remaining dice
    player.playerDice = rollNDice(player.playerDice.length);
    updatePlayer(playerNum);

    return player.playerDice;

}

// ******************************* PLAYING ************************************************

function playDie(playerID, gameIDparam, cardSlot, die, cardDieIndex){
    //if player hasnt rolled yet
    if(!rolled){
        return `{'error': 'Player hasn't rolled yet'}`;
    }


    //validate valid die
    if(die < 1 || die > 6){
        return `{'error': 'Invalid die value'}`;
    }

    //check if gameid is correct
    if(gameID != gameIDparam){
        return `{'error': 'Invalid game'}`;
    }

    //See if player is in game and get their player object
    let rPlayerJson = isPlayerInGame(playerID,gameID) 
    let playerNum = rPlayerJson.playerNum;
    //if playerID not in game, return nll
    if(playerNum === -1){
        return `{'error': 'Player not in game'}`;
    }

    //validate cardSlot
    if(cardSlot < 1 || cardSlot > 3 ){
        return `{'error': 'Invalid card range'}`;
    }

    let cardID = 'card' + cardSlot;

    //validate cardDieIndex
    if(cardDieIndex < 0 || cardDieIndex >= board[cardID].valuesNeed.length){
        return `{'error': 'Invalid dice placement'}`;
    }

    //check if the die exists at the cardDieIndex
    if(board[cardID].valuesNeed[cardDieIndex] != die){
        return `{'error': 'Wrong die'}`;
    }

    //get playerObject
    let player = rPlayerJson.playerObj;

    //check if player is attempting to getDie back
    let dieCardID = 'card'+cardSlot+'_'+cardDieIndex+'_'+die
    if(playerTurnArray.includes(dieCardID)){
        //if player does want to undo

        //remove from lockedDice to playerDice
        player['lockedDice'].splice(player['lockedDice'].indexOf(die,1));
        player['playerDice'].push(die);

        //update card to remove player
        board[cardID]['player'+playerNum][cardDieIndex] = 0; 
        
        //remove from playerTurnArray
        playerTurnArray.splice(playerTurnArray.indexOf(dieCardID),1);

        console.log('hello');
        //update displays
        updatePlayer(playerNum);
        updateBoard();

        return `{'success': 'Player took back the die'}`;
    }


    //check if die already exists for player
    if(board[cardID]['player'+playerNum][cardDieIndex] !== 0){
        return `{'error': 'Player already has a die in that slot'}`;
    }

    //check if player has die
    if(!player.playerDice.includes(die)){
        return `{'error': 'Player does not has die with value ${die}'}`;
    }

    //all checks have passed, play the die onto the card

    //locks the die for the player
    board[cardID]['player'+playerNum][cardDieIndex] = die; 

    //removes the value from the player's dice and pushes to the players locked array
    player['playerDice'].splice(player['playerDice'].indexOf(die),1);
    player['lockedDice'].push(die);

    //adds to currentPlayerTurn
    playerTurnArray.push(dieCardID);

    updatePlayer(playerNum);
    updateBoard();

    return `{'success': 'Player ${player.username} played ${die} on card ${cardSlot}}`;


}

/**
 * REturns all the dice from a card from a player
 * 
 * @param {*} playerID 
 * @param {*} gameIDparam 
 * @param {*} cardSlot 
 * @returns 
 */
function retrieveAllDiceFromCard(playerID, gameIDparam, cardSlot){
    //check if gameid is correct
    if(gameID != gameIDparam){
        return `{'error': 'Invalid game'}`;
    }

    //See if player is in game and get their player object
    let rPlayerJson = isPlayerInGame(playerID,gameID) 
    let playerNum = rPlayerJson.playerNum;
    //if playerID not in game, return nll
    if(playerNum === -1){
        return `{'error': 'Player not in game'}`;
    }

    //validate cardSlot
    if(cardSlot < 1 || cardSlot > 3 ){
        return `{'error': 'Invalid card range'}`;
    }

    let cardID = 'card' + cardSlot;

    //return all dice to player
    board[cardID]['player'+playerNum] = outputEmptyPlayer(board[cardID].valuesNeed.length); 
    console.log('hello');
    return `{'success' : 'Card ${cardSlot} has been reset for player${playerNum}}`

}



// ******************************* SCORING *************************************


/**
 * Returns the dice on a scored card back to the owners (helper function)
 * 
 * @param {*} cardSlot 
 * @returns 
 */
function returnScoredDice(cardSlot){
 
    let card = board['card' + cardSlot];

    //iterate through each player
    for(let i = 1; i <= maxPlayers; i++){
        let player = players['player' + i];
        let playerCard = card['player' + i];

        //iterate over the playersLocked dice
        for(let j = 0; j < card.valuesNeed.length; j++){

            if(playerCard.at(j) !== 0){ //if the player had a die in the slot

                //return the die from the players 'lockedDie array'
                player['lockedDice'].splice(player['lockedDice'].indexOf(playerCard.at(j)),1);
                player['playerDice'].push(playerCard.at(j) );
            }
        }

    }
    //update display
    updateBoard();
    updateAllPlayers();
}


/**
 * Attempts to score a card
 * 
 * 
 * @param {*} cardSlot 
 * @returns 
 */
function scoreCard(cardSlot){

    //validate cardSlot
    if(cardSlot < 1 || cardSlot > 3 ){
        return `{'error': 'Invalid card range'}`;
    }

    let card = board['card' + cardSlot];


    //for each player, check if all cardslots are filled
    for(let i = 1; i <= maxPlayers; i++){
        let player = 'player' + i;

        if(!card[player].includes(0)){ //if all slots are filled in, there are no 0

            //return all dice to the respective players
            returnScoredDice(cardSlot);

            //add score to players score
            players[player]['score'] = players[player]['score'] + card['points'];

            //delete scored card
            delete board['card'+cardSlot];
            //get new card
            if(isRandom){
                addRandomCardToBoard(cardSlot);
            }
            else{
                addCardToBoard(cardSlot);
            }

            //update displays
            updateAllPlayers();
            updateBoard();

            return `{'Scored': "${player} scored ${card['points']} and a new cards was replaced}`
        } 
    }
    return `{'Unscored' : "Card wasn't scored}`;
}

function didGameEnd(){
    for(let i = 1; i<= maxPlayers; i++){
        if(players['player'+i]['score'] >= maxScore){
            console.log('Player' +i + 'has won the game!')
            return i;
        }

    }
    return -1;
}
// *************************** Player Turns ***************************

//gets the current turn
function getCurrentPlayerTurn(){
    return 'player' + playerTurn;
}

//sets the turn to the next player
function nextTurn(){
    playerTurn = (playerTurn++ % maxPlayers) + 1
    return 'player' + playerTurn;
}


function endTurn(){
    //get currentPlayer
    let curPlayer = getCurrentPlayerTurn();

    //get the player id
    let curPlayerID = players[curPlayer].playerID;


    //score cards
    for(let i = 1; i <= 3; i++){
        scoreCard(i);
    }
    
    //test if game ended
    let winningPlayerNum = didGameEnd();
    if(winningPlayerNum > 0 && winningPlayerNum <= maxPlayers){
        gameOverDisplay('player' + winningPlayerNum);
        console.log('game ended');
        //FILL OUT WITH GAME END STUFF
    }
    else{
        console.log('next turn')
        //resets the playerTurnArray
        playerTurnArray = [];
        //resets rolled to false
        rolled = false;
        //get next turn
        let nextPlayer = players[nextTurn()];
        currentTurnDisplay(nextPlayer.username, nextPlayer.color);

    }
}


// ************************** DISPLAY ********************************** 

function returnDiceSVG(offsetX, offsetY, die){


    //switch between the dice values
    switch(die){
        //d5 pip
        case 6:
        return `
            <rect width="75" height="75" fill="white" x="${offsetX}px" y="${offsetY}px"/> 
            <circle r="10" cx="${20 + offsetX}px" cy="${15 + offsetY}px"/>
            <circle r="10" cx="${20 + offsetX}px" cy="${37.5 + offsetY}px"/> 
            <circle r="10" cx="${20 + offsetX}px" cy="${60 + offsetY}px"/> 
            <circle r="10" cx="${50 + offsetX}px" cy="${15 + offsetY}px"/>
            <circle r="10" cx="${50 + offsetX}px" cy="${37.5 + offsetY}px"/>
            <circle r="10" cx="${50 + offsetX}px" cy="${60 + offsetY}px"/>
        `;
        // 5 pip
        case 5:
        return `
            <rect width="75" height="75" fill="white" x="${offsetX}px" y="${offsetY}px"/> 
            <circle r="10" cx="${15+ offsetX}px" cy="${15 + offsetY}px"/> 
            <circle r="10" cx="${15+ offsetX}px" cy="${60 + offsetY}px"/>
            <circle r="10" cx="${37.5+offsetX}px" cy="${37.5 + offsetY}px"/>
            <circle r="10" cx="${60+ offsetX}px" cy="${15 + offsetY}px"/>
            <circle r="10" cx="${60+ offsetX}px" cy="${60 + offsetY}px"/>
        `;
        //4 pip
        case 4:
        return `
            <rect width="75" height="75" fill="white" x="${offsetX}px" y="${offsetY}px"/> 
            <circle r="10" cx="${15+ offsetX}px" cy="${15 + offsetY}px"/> 
            <circle r="10" cx="${15+ offsetX}px" cy="${60 + offsetY}px"/>
            <circle r="10" cx="${60+ offsetX}px" cy="${15 + offsetY}px"/>
            <circle r="10" cx="${60+ offsetX}px" cy="${60 + offsetY}px"/> 
        `;
        //3 pip
        case 3:
        return `
            <rect width="75" height="75" fill="white" x="${offsetX}px" y="${offsetY}px"/> 
            <circle r="10" cx="${15+ offsetX}px" cy="${60 + offsetY}px"/>
            <circle r="10" cx="${37.5+ offsetX}px" cy="${37.5 + offsetY}px"/>
            <circle r="10" cx="${60+ offsetX}px" cy="${15 + offsetY}px"/>
        `;
        //2 pip
        case 2:
        return `
            <rect width="75" height="75" fill="white" x="${offsetX}px" y="${offsetY}px"/> 
            <circle r="10" cx="${15+ offsetX}px" cy="${60 + offsetY}px"/>
            <circle r="10" cx="${60+ offsetX}px" cy="${15 + offsetY}px"/>
        `;
        //1 pip
        case 1:
        return `
            <rect width="75" height="75" fill="white" x="${offsetX}px" y="${offsetY}px"/> 
            <circle r="10" cx="${37.5+ offsetX}px" cy="${37.5 + offsetY}px"/>
        `;
        default:
            return null;
    }

}

function cardGenerator(points, valuesNeed, cardSlot){
    let offsetXArray = [],
        offsetYarray = [],
        color;

   
        //get the offsets to the 
    switch(points){
        case 15:
            offsetXArray = [15, 110, 15, 110, 15, 110];
            offsetYarray = [15, 15, 110, 110, 200, 200];
            color = '#daa520'
            break;
        case 10:
            offsetXArray = [15, 110, 15, 110];
            offsetYarray = [55, 55, 155, 155];
            color = '#c0c0c0';
            break;
        case 5:
            offsetXArray = [15, 65, 110];
            offsetYarray = [15, 107.5, 200];
            color = '#CE8946';
            break;
        case 2:
            offsetXArray = [15, 110];
            offsetYarray = [110, 110];
            color = '#dedecb';
            break;
        default:
            return;
    }

    //Make Dice Constants

    //Build up frame
    let frame = `
                <rect width='200px' height='300px'fill="${color}"/>
                <text x="180" y="295" class="points">${points}</text>
    `

     //loop over the and fill in the remaining with the dice
    for(let i = 0; i < valuesNeed.length; i++){
        frame += returnDiceSVG(offsetXArray[i],offsetYarray[i],valuesNeed[i]);

        //extract id
        let id = 'card'+cardSlot+'_'+i+'_'+valuesNeed[i];

        //add tiny dice if player has locked dice
        for(let j = 1; j <= maxPlayers; j++){
            if(board['card'+cardSlot]['player'+j][i] !== 0) { //if die is filled in
                frame += `<rect width="15" height="15" fill-opacity="50%" fill="${players['player'+j].color}" x="${offsetXArray[i] + 60}px" y="${offsetYarray[i] + 60 - (j - 1 ) * 20}px" />`;
            }
        }

        //add on top of panel
        frame +=`<rect id='${id}' onclick="cardDieClick( '${id}' );" width="75" height="75" fill-opacity="0.1%" fill="white" x="${offsetXArray[i]}px" y="${offsetYarray[i]}px"/>`
    }
    

    return frame;
}

/**
 * Helper function to generate the dice to be put into the player areas
 * 
 * @param {*} offsetX 
 * @param {*} die 
 * @returns 
 */
function playerDiceGeneratorSVG(offsetX, die){

    //switch between the dice values
    switch(die){
        //d5 pip
        case 6:
        return `
            <rect width='37.5px' height='37.5'fill="white" x='${offsetX}' y='30'/>
            <circle r="5" cx="${10 + offsetX}px"cy="37.5px"/>
            <circle r="5" cx="${10 + offsetX}px" cy="48.75px"/> 
            <circle r="5" cx="${10 + offsetX}px" cy="60px"/> 
            <circle r="5" cx="${25 + offsetX}px"cy="37.5px"/>
            <circle r="5" cx="${25 + offsetX}px" cy="48.75px"/>
            <circle r="5" cx="${25 + offsetX}px" cy="60px"/>
        `;
        // 5 pip
        case 5:
        return `
            <rect width='37.5px' height='37.5'fill="white" x='${offsetX}' y='30'/>
            <circle r="5" cx="${7.5+ offsetX}px"cy="37.5px"/> 
            <circle r="5" cx="${7.5 + offsetX}px" cy="60px"/>
            <circle r="5" cx="${18.75+offsetX}px" cy="48.75px"/>
            <circle r="5" cx="${30+ offsetX}px"cy="37.5px"/>
            <circle r="5" cx="${30+ offsetX}px" cy="60px"/>
        `;
        //4 pip
        case 4:
        return `
            <rect width='37.5px' height='37.5'fill="white" x='${offsetX}' y='30'/>
            <circle r="5" cx="${7.5+ offsetX}px"cy="37.5px"/> 
            <circle r="5" cx="${7.5+ offsetX}px" cy="60px"/>
            <circle r="5" cx="${30+ offsetX}px"cy="37.5px"/>
            <circle r="5" cx="${30+ offsetX}px" cy="60px"/> 
        `;
        //3 pip
        case 3:
        return `
            <rect width='37.5px' height='37.5'fill="white" x='${offsetX}' y='30'/>
            <circle r="5" cx="${7.5+ offsetX}px" cy="60px"/>
            <circle r="5" cx="${18.75+ offsetX}px" cy="48.75px"/>
            <circle r="5" cx="${30+ offsetX}px"cy="37.5px"/>
        `;
        //2 pip
        case 2:
        return `
            <rect width='37.5px' height='37.5'fill="white" x='${offsetX}' y='30'/>
            <circle r="5" cx="${7.5+ offsetX}px" cy="60px"/>
            <circle r="5" cx="${30+ offsetX}px"cy="37.5px"/>
        `;
        //1 pip
        case 1:
        return `
            <rect width='37.5px' height='37.5'fill="white" x='${offsetX}' y='30'/>
            <circle r="5" cx="${18.75+ offsetX}px" cy="48.75px"/>
        `;
        default:
            return null;
    }
}



/**
 *  Generates the sidebar for the players 
 * 
 * @param {*} playerNum 
 */
function playerAreaGenerator(playerNum){
    //get Player Obj
    let player = players['player'+playerNum];

    let color = player.color, score = player.score, username = player.username;

    let frame = `
            <rect width='400px' height='100px'fill="${color}" opacity='70%'/>
            <text x="5" y="20" class="points">${score}</text>
            <text x="295" y="20" class="points" direction="rtl">${username}</text>
    `
    for(let i = 0; i < player.playerDice.length; i++){
        frame += playerDiceGeneratorSVG(48.2 * i +10.7, player.playerDice[i]);
    }

    document.getElementById('player'+playerNum+'Area').innerHTML = frame;
}




//display the game is over and a player won
function gameOverDisplay(playerParam){
    let player = players[playerParam];

    let html = 
    `
        <div>
            ${player.username} has won the game!
    </div>

    `
    let gameEndDiv = document.getElementById('gameEnd');

    //update the display
    gameEndDiv.innerHTML = html;
    gameEndDiv.style.display = 'block';
    gameEndDiv.style.width = window.innerWidth;
    gameEndDiv.style.display = document.getElementsByTagName('body');


}

//currentPlayer banner
function currentTurnDisplay(username, color){
    let html = 
    `
        <rect width='750px' height='100px'fill="${color}" opacity='70%'/>
        <text x="705" y="50" class="scoreboard points" direction='rtl'>${username}'s Turn</text>
    `

    document.getElementById('curPlayerBanner').innerHTML = html;
}


// ************************** UPDATE DISPLAY ********************************** 

//updates the boardDisplay
function updateBoard(){

    // let holder = document.createElement('div');
    // let curPlayerDiv = document.createElement('div');
    // curPlayerDiv.innerHTML = `player${playerTurn}`;
    // holder.appendChild(curPlayerDiv);

    for(let i = 1; i <= 3; i++){
        // let a = document.createElement('div');
        // a.innerHTML = JSON.stringify(board['card' + i]);
        // holder.appendChild(a);
        // holder.appendChild(document.createElement('br'));

        //update the 3 cards
        let card = board['card' +i];
        let t = cardGenerator(card.points, card.valuesNeed, i);
        document.getElementById('card'+i+'SVG').innerHTML = t;

        console.log(t);
    }

    //replace body
    // if(document.getElementById('board').children.length != 0){
    //     document.getElementById('board').children[0].remove();
    // }
    // //append to body
    // document.getElementById('board').appendChild(holder);

    

}


/**
 * Updates a players display
 * 
 * @param {*} playerNum 
 */
function updatePlayer(playerNum){
//     let textContent = `
//   ${JSON.stringify(players['player' + playerNum])}`


//     document.getElementById(`player${playerNum}`).textContent = textContent;

    playerAreaGenerator(playerNum);

}

/**
 * Updates all players displays
 * 
 */
function updateAllPlayers(){
    for(let i = 1; i <= maxPlayers; i++){
        updatePlayer(i);
    }
}





// ***************************** Event Listener Functions *******************************************

/**
 * Ends turn even listener
 */
function endTurnEvent(){
    endTurn();
    updateBoard();
}

/**
 * Rolls all the remaining dice for the current Players turn
 */
function rollDieEvent(){

    //if didnt already roll
    if(!rolled){
        let curPlayerID = getCurrentPlayerID(); //get current players id

        playerRoll(curPlayerID); //roll the remaining dice

        updatePlayer(playerTurn); //update the board;
    }
    else{
        console.log(`{'error': 'Player already rolled this turn'}`)
    }

}


/**
 * Rolls all the remaining dice for the current Players turn
 */
function rollAllDieEvent(){
     //if didnt already roll
    if(!rolled){

        let curPlayerID = getCurrentPlayerID(); //get current players id

        playerRoll(curPlayerID,true); //return all dice and roll all

        updatePlayer(playerTurn); //update the board;
        updateBoard();
    }else{
        console.log(`{'error': 'Player already rolled this turn'}`)
    }
}

function cardDieClick(cardName){
    //get and split out the args
    let args = cardName.split('_');

    //parse out the params
    let cardSlot = parseInt(args[0].charAt(4)), index = parseInt(args[1]), die = parseInt(args[2]);

    //get id
    let playerID = getCurrentPlayerID();

    //play the die
    let result = playDie(playerID, gameID, cardSlot,die, index);

    //updateBoard with playerColor
    // generatePlayerCube(getCurrentPlayerID().color,die, cardName);

    console.log(result)
}

function generatePlayerCube(playerColor, cardID){
    let underCard = document.getElementById(cardID + '_Under');
    let text = `<rect width="10" height="10" fill="${playerColor}"/>`;
    underCard.innerHTML = underCard.innerHTML + text; 

}



// ******************************** TESTING ************************************
function attempt(){
    let card = board['card1'];
    


    let t = cardGenerator(card.points, card.valuesNeed, 1);
    console.log(t);
    document.getElementById('card1SVG').innerHTML = t;
}


function attempt2(){
    let card = board['card2'];
    


    let t = cardGenerator(card.points, card.valuesNeed, 2);
    console.log(t);
    document.getElementById('card2SVG').innerHTML = t;
}

function overWriteCardslot(cardslot){
     delete board['card'+cardslot];

    addRandomCardToBoard(cardslot);


            //update displays
            updateAllPlayers();
            updateBoard();
}