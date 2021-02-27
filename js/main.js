/**
 * 
 * 
 * @author Francisco Javier González Sabariego
 */
{
    let boardGame  = null;
    let difficulty = 1;
    let newRecord  = false;

    const createCookies = (difficultyLevels) => {
        if (localStorage.getItem("buscaminas_0") == null) 
            [...difficultyLevels.children].forEach( e => localStorage.setItem(`buscaminas_${e.value}`, 86400) );
    }

    document.addEventListener("DOMContentLoaded", () => {
        const main         = document.getElementsByTagName("main")[0];
        const select       = document.getElementsByTagName("select")[0];
        const endScreen    = document.body.getElementsByTagName("div")[0];
        const buttonReset  = document.getElementsByTagName("button")[0];

        const boardGameGui = main.children[0].children[1];
        const displayFlags = main.children[0].children[2].children[1].children[1];
        const displayTime  = main.children[0].children[2].children[2].children[1];
        const message      = endScreen.children[0];

        displayTime.innerHTML = '00:00:00';

        createCookies(select);

        document.addEventListener("contextmenu", e => e.preventDefault() );

        const renderBoardGame = (coordinates) => {
            const BOARDGAME = Game.getBoardGame();
            const SIZE_BOARDGAME = BOARDGAME.length;
            const [row,column] = [...coordinates];

            let delayBomb = 0;
    
            for (let i = 0; i < SIZE_BOARDGAME; i++)
                for (let j = 0; j < SIZE_BOARDGAME; j++) {
                    if (BOARDGAME[i][j].getStatus() !== 0) 
                        boardGame[i][j].classList = BOARDGAME[i][j].getStatus() === 1 ? `square-${difficulty} sq flag` : `square-${difficulty} sq question-mark`;
                    else {
                        boardGame[i][j].classList = BOARDGAME[i][j].getVisible() ? `square-${difficulty} sq${BOARDGAME[i][j].getValue()}` : `square-${difficulty} sq`;
                        boardGame[i][j].innerHTML = BOARDGAME[i][j].getVisible() && BOARDGAME[i][j].getValue() > 0 ? `<b>${BOARDGAME[i][j].getValue()}</b>` : ``;
                        if (Game.getLoseGame() && BOARDGAME[i][j].getValue() == -1)
                            i == row && j == column ? boardGame[i][j].style.animation = `detonateBomb 1s forwards` : boardGame[i][j].style.animation = `detonateBomb 1s ${1 + 0.25 * ++delayBomb}s forwards`;
                    }
                }
        }

        const renderTime = function() {
            setInterval( () => {
                displayTime.innerHTML = `${Game.getTime(true)}`;
            }, 250);
        }

        const render = function(coordinates) {
            renderBoardGame(coordinates);

            displayFlags.innerHTML = `${Game.getAvailableFlags()}`;

            if (Game.getWinGame() || Game.getLoseGame()) {
                if (Game.getWinGame()) {
                    newRecord = Game.getTime() < localStorage.getItem(`buscaminas_${difficulty}`);
                    localStorage.setItem(`buscaminas_${difficulty}`,Game.getTime());
                }
                
                message.classList = `message ${Game.getWinGame() ? 'win' : 'lose'}`;
                message.style.animation = `showMessage 1s forwards`;
                message.children[0].innerHTML = Game.getLoseGame() ? `<h3>¡Lo siento, has perdido! \u{1F622}</h3>` :
                    newRecord ? `<h3>¡¡Enhorabuena, has ganado!! \u{1F389}</h3><h3>¡¡Has obtenido un nuevo record!! Terminaste en ${Game.getTime(true)}  \u{1F389}\u{1F389}</h3>` :
                        `<h3>¡¡Enhorabuena, has ganado!! \u{1F389}</h3>`;
                endScreen.classList.toggle("hidden");
            }
        }
    
        const createSquare = function(row,column) {
            const div = document.createElement("div");
            div.classList = `square-${difficulty} sq`
            div.addEventListener("mousedown", e => {
                Game.action(e.buttons,[row,column]);
                render([row,column]);
            } );
            return div;
        }
    
        const createBoardGame = function() {
            let boardGame = [];
            const fragment = new DocumentFragment();
            const columns = Game.getBoardGame().length;
            for (let i = 0; i < columns; i++) {
                boardGame.push([]);
                for (let j = 0; j < columns; j++) {
                    const square = createSquare(i,j);
                    boardGame[i].push(square);
                    fragment.appendChild(square);
                }
            }
            return [boardGame,fragment];
        }

        const initGame = function(difficulty) {
            let fragment = null;
            boardGameGui.innerHTML = ``;
    
            Game.init(difficulty);
    
            [boardGame,fragment] = createBoardGame(difficulty);
    
            boardGameGui.classList = `board board-${difficulty}`;
            boardGameGui.appendChild(fragment);
            displayFlags.innerHTML = `${Game.getAvailableFlags()}`;
        }

        initGame(1);
        renderTime();

        select.addEventListener( "change", () => {
            difficulty = select.value;
            initGame(difficulty);
        } );

        buttonReset.addEventListener("click", () => {
            newRecord = false;
            message.classList = `message hidden`;
            endScreen.classList.toggle("hidden");
            initGame(difficulty);
        })
    });
}
