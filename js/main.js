/**
 * 
 * 
 * @author Francisco Javier González Sabariego
 */
{
    let boardGame = null;
    let difficulty = 1;

    document.addEventListener("DOMContentLoaded", () => {
        const main         = document.getElementsByTagName("main")[0];
        const select       = document.getElementsByTagName("select")[0];
        const boardGameGui = main.children[0].children[1];
        const displayFlags = main.children[0].children[2].children[1].children[1];
        const displayTime  = main.children[0].children[2].children[2].children[1];
        const message      = main.children[0].children[2].children[3];
        const buttonReset  = document.getElementsByTagName("button")[0];

        document.addEventListener("contextmenu", e => e.preventDefault() );

        const renderAvailableFlags = function() {
            displayFlags.innerHTML = `${Game.getAvailableFlags()}`;
        }

        const renderTime = function() {

        }

        const render = function(coordinates) {
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
            
            renderAvailableFlags();
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
            renderAvailableFlags();
        }

        initGame(1);

        select.addEventListener( "change", () => {
            difficulty = select.value;
            initGame(difficulty);
        } );
    });
}
