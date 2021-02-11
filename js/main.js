/**
 * 
 * 
 * @author Francisco Javier González Sabariego
 */
{
    let boardGame = null;

    const selectClass = n => {
        const a = {
            '-1': 'sq-1',
            '0': 'sq0',
            '1': 'sq1',
            '2': 'sq2',
            '3': 'sq3',
            '4': 'sq4',
            '5': 'sq5',
            '6': 'sq6',
            '7': 'sq7',
            '8': 'sq8'
        }
        return a[`${n}`];
    }

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

        const render = function(difficulty) {
            const BOARDGAME = Game.getBoardGame();
            const SIZE_BOARDGAME = BOARDGAME.length;
    
            for (let i = 0; i < SIZE_BOARDGAME; i++)
                for (let j = 0; j < SIZE_BOARDGAME; j++) {
                    if (BOARDGAME[i][j].getStatus() !== 0) {
                        boardGame[i][j].innerHTML = BOARDGAME[i][j].getStatus() === 1 ? '<b>\u{1F3F2}</b>' : '<b>?</b>';
                        boardGame[i][j].classList = BOARDGAME[i][j].getStatus() === 1 ? `square-${difficulty} sq error` : `square-${difficulty} sq`;
                    }
                    else {
                        boardGame[i][j].classList = BOARDGAME[i][j].getVisible() ? 
                            `square-${difficulty} sq${BOARDGAME[i][j].getValue()}` : `square-${difficulty} sq`;
                        boardGame[i][j].innerHTML = BOARDGAME[i][j].getVisible() && BOARDGAME[i][j].getValue() === -1 ? '<b>\u{1F4A5}</b>' : BOARDGAME[i][j].getVisible() && BOARDGAME[i][j].getValue() > 0 ?
                            `<b>${BOARDGAME[i][j].getValue()}</b>` : ``;
                    }
                }
            
            renderAvailableFlags();
        }
    
        const createSquare = function(row,column,difficulty) {
            const div = document.createElement("div");
            div.classList = `square-${difficulty} sq`
            div.addEventListener("mousedown", e => {
                Game.action(e.buttons,[row,column]);
                render(difficulty);
            } );
            return div;
        }
    
        const createBoardGame = function(difficulty) {
            let boardGame = [];
            const fragment = new DocumentFragment();
            const columns = Game.getBoardGame().length;
            for (let i = 0; i < columns; i++) {
                boardGame.push([]);
                for (let j = 0; j < columns; j++) {
                    const square = createSquare(i,j,difficulty);
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

        select.addEventListener( "change", () => initGame(select.value) );
    });
}
