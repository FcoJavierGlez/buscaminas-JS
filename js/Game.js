Game = ( 
    function () {
        let boardGame  = [];
        let temporizer = null;
        let numberMines, availableFlags = 0;
        let activatedClue, createdBoard, loseGame, winGame = false;

        /**
         * Inicia el juego con la dificultad pasada por parámetro
         * en caso de que el parámetro no se corresponda con un valor
         * entre [0-2] se asignará por defecto el valor 1, es decir, 
         * una dificultad normal.
         * 
         * @param {Number} difficulty Dificultad del juego, rango [0-2]
         */
        const init = function(difficulty) {
            if (isNaN(difficulty) || difficulty < 0 || difficulty > 2) difficulty = 1;
            activatedClue = createdBoard = loseGame = winGame = false;
            boardGame = createBoardGame(difficulty);
            availableFlags = numberMines  = setNumberMines(difficulty);
            temporizer = new Chronometer(0);
        }

        /**
         * Devuelve el total de banderas disponibles
         * 
         * @return {Number} Número de banderas disponibles
         */
        const getAvailableFlags = function() {
            return availableFlags;
        }

        /**
         * Devuelve el tablero con los objetros casillas en su interior
         * para su renderizado.
         * 
         * @return {Array} Array bidimensional con los objetos de la clase Square que conforman el tablero
         */
        const getBoardGame = function() {
            return boardGame;
        }

        /**
         * Devuelve si se ha perdido el juego
         * 
         * @return {Boolean} Verdadero si el juego se ha perdido
         */
        const getLoseGame = function() {
            return loseGame;
        }

        /**
         * Devuelve si se ha ganado el juego
         * 
         * @return {Boolean} Verdadero si el juego se ha ganado
         */
        const getWinGame = function() {
            return winGame;
        }

        /**
         * Devuelve el tiempo al macenado en el temporizador
         * 
         * @param {Boolean} formatTime True para obtener un tiempo formateado '23:59:59' false para obtener el total en segundos
         * 
         * @return Tiempo almacenado en el temporizador
         */
        const getTime = function(formatTime = false) {
            return temporizer.getTime(formatTime);
        }

        /**
         * Crea el tablero de juego cuando se llama a la función init
         * 
         * @param {Number} difficulty Dificultad del juego, rango [0-2]
         * 
         * @return {Array} Tablero bidimensional generado con las dimensiones según su dificultad
         */
        const createBoardGame = function(difficulty) {
            let boardGame = [];
            const SIZE_BOARDGAME = {
                '0': 10,
                '1': 16,
                '2': 22
            }

            for (let i = 0; i < SIZE_BOARDGAME[difficulty]; i++) {
                boardGame.push([]);
                for (let j = 0; j < SIZE_BOARDGAME[difficulty]; j++)
                    boardGame[i].push( new Square() );
            }
            return boardGame;
        }

        /**
         * Asigna el número de minas en función de la dificultad elegida
         * 
         * @param {Number} difficulty Dificultad del juego, rango [0-2]
         * 
         * @return {Number} Total de minas para el juego actual según la dificultad
         */
        const setNumberMines = function(difficulty) {
            const NUMBER_MINES = {
                '0': 10,
                '1': 40,
                '2': 99
            }
            return NUMBER_MINES[difficulty];
        }

        /**
         * Imprime en consola el tablero, si se le pasa por parámetro 'true' mostrará
         * todo el tablero, de lo contrario (por defecto) mostrará las casillas reveladas
         * 
         * @param {Boolean} showHiddenSquare Muestra todas las casillas en caso de ser verdadero, por defecto,
         *                                      sólo mostrará las casillas reveladas
         * 
         * @return {String} Caracteres que se va a imprimir en la consola correspondiente al estado del tablero actual
         *                  según el valor o el estado de cada casilla
         */
        const showBoardGame = function(showHiddenSquare = false) {
            if (boardGame.length == 0)
                console.log("Debes crear un tablero");
            else 
                showHiddenSquare ? 
                    boardGame.forEach( e => console.log( e.map( e => e.getValue() === -1 ? '*' : e.getValue().toString() ) ) ) : 
                    boardGame.forEach( e => console.log( e.map( e => {
                        if (e.getStatus() !== 0)
                            return e.getStatus() === 1 ? 'F' : '?'
                        else if (!e.getVisible())
                            return ' ';
                        return e.getValue() > -1 ? e.getValue().toString() : '*'
                    } ) ) )
        }

        const min = (n,m) => n < m ? m : n;
        const max = (n,m) => n > m ? m : n;

        /**
         * Invalida las coordenadas al generarse una mina en caso de coincidir con las coordenadas 
         * del primer click que provoca la generación de las minas en el tablero. 
         * 
         * De esta forma se obtiene que la casilla donde se hizo el primer click jamás tenga 
         * una mina y, por tanto, sea imposible perder en el primer click.
         * 
         * @param {Number} inputRow     Coordenada de la fila del primer click en el tablero
         * @param {Number} inputColumn  Coordenada de la columna del primer click en el tablero
         * @param {Number} row          Coordenada de la fila dónde se va a insertar una mina generada
         * @param {Number} column       Coordenada de la columna dónde se va a insertar una mina generada
         * 
         * @return {Boolean} True si las coordenadas son denegadas, false si las coordenadas están libres para insertar una mina
         */
        const denegatedCoord = function(inputRow, inputColumn, row, column) {
            let maxRow = max(row + 1,boardGame.length - 1);
            let maxCol = max(column + 1,boardGame.length - 1);
            for (let i = min(row - 1,0); i <= maxRow; i++) 
                for (let j = min(column - 1,0); j <= maxCol; j++) 
                    if (i === inputRow && j === inputColumn) 
                        return true;
            return false;
        }

        /**
         * Revela un área vacía a partir de un click en una casilla cuyo valor sea cero.
         * 
         * @param {Array} param0 Coordenadas [fila,columna] de la casilla que se va a revelar
         */
        const revealEmptyArea = function([row,column]) {
            let maxRow = max(row + 1,boardGame.length - 1);
            let maxCol = max(column + 1,boardGame.length - 1);
            for (let i = min(row - 1,0); i <= maxRow; i++)
                for (let j = min(column - 1,0); j <= maxCol; j++) {
                    if ( (i === row && j === column) || boardGame[i][j].getVisible() ) continue;
                    boardGame[i][j].revealSquare();
                    boardGame[i][j].setStatus(0);
                    if (boardGame[i][j].getValue() === 0)
                        revealEmptyArea([i,j]);
                }
        }

        /**
         * Revela el tablero del juego una vez se ha terminado bien por haber perdido o por haber ganado
         */
        const revealBoardGame = function() {
            for (let i = 0; i < boardGame.length; i++) 
                for (let j = 0; j < boardGame.length; j++) {
                    if (winGame) 
                        boardGame[i][j].getValue() === -1 ? boardGame[i][j].setStatus(1) : false;
                    else {
                        if ( boardGame[i][j].getValue() === -1 && boardGame[i][j].getStatus() !== 1 ) boardGame[i][j].revealSquare();
                        else if ( boardGame[i][j].getValue() !== -1 && boardGame[i][j].getStatus() === 1 ) boardGame[i][j].setStatus(0);
                    }
                }
        }

        /**
         * Inserta una mina en el tablero en las coordenadas pasadas por parámetro.
         * 
         * @param {Number} row    Coordenada fila de la mina
         * @param {Number} column Coordenada columna de la mina
         */
        const setMine = function(row,column) {
            boardGame[row][column].setValue(-1);
            let maxRow = max(row + 1,boardGame.length - 1);
            let maxCol = max(column + 1,boardGame.length - 1);
            for (let i = min(row - 1,0); i <= maxRow; i++) 
                for (let j = min(column - 1,0); j <= maxCol; j++) {
                    if (boardGame[i][j].getValue() === -1) continue;
                    boardGame[i][j].increaseValue();
                }
        }

        /**
         * Inserta las minas en el tablero cuando se realiza el primer click
         * exceptuando la casilla en la que se ralizó el susodicho primer click 
         * 
         * @param {Array} param0 Coordenadas [fila,columna] de la casilla donde se ha relizado el primer click
         */
        const insertMines = function([inputRow,inputColumn]) {
            let [row,column] = [undefined,undefined];
            for (let totalMines = 0; totalMines < numberMines; totalMines++) {
                do {
                    [row,column] = [parseInt( Math.random() * boardGame.length ),parseInt( Math.random() * boardGame.length )];
                } while ( boardGame[row][column].getValue() === -1 || denegatedCoord(inputRow,inputColumn,row,column) );
                setMine(row,column);
            }
            createdBoard = true;
        }

        /**
         * Comprueba si se ha ganado el juego
         * 
         * @return {Boolean} True si el juego se ha ganado, false no está ganado.
         */
        const checkWin = function() {
            let count = 0;
            for (let i = 0; i < boardGame.length; i++)
                for (let j = 0; j < boardGame.length; j++) 
                    count += !boardGame[i][j].getVisible() ? 1 : 0;
            winGame = count === numberMines;
        }
    
        /**
         * Realiza un recuento de las banderas disponibles en el tablero
         * cada vez que añadimos, eliminamos una o cada vez que se revela un área
         * del tablero donde pudiera haber banderas
         * 
         * @return {Number} Total de banderas disponibles
         */
        const recountAvailableFlags = function() {
            if (winGame) return 0;
            let countAvailableFlags = numberMines;
            for (let i = 0; i < boardGame.length; i++) 
                for (let j = 0; j < boardGame.length; j++) 
                    countAvailableFlags -= boardGame[i][j].getStatus() === 1 ? 1 : 0;
            return countAvailableFlags;
        }

        /**
         * 
         * @param {*} row 
         * @param {*} column 
         */
        const accountFlagsAroundSquare = function(row,column) {
            let account = 0;
            let maxRow = max(row + 1,boardGame.length - 1);
            let maxCol = max(column + 1,boardGame.length - 1);
            for (let i = min(row - 1,0); i <= maxRow; i++) 
                for (let j = min(column - 1,0); j <= maxCol; j++) 
                    if (!boardGame[i][j].getVisible() && boardGame[i][j].getStatus() === 1) ++account;
            return account
        }

        /**
         * 
         * @param {*} row 
         * @param {*} column 
         * @param {*} clue 
         */
        const algo = function(row,column,clue = false) {
            let maxRow = max(row + 1,boardGame.length - 1);
            let maxCol = max(column + 1,boardGame.length - 1);
            for (let i = min(row - 1,0); i <= maxRow; i++) {
                for (let j = min(column - 1,0); j <= maxCol; j++) {
                    if (clue) 
                        !boardGame[i][j].getVisible() ? boardGame[i][j].enableClue() : false;
                        //!boardGame[i][j].getVisible() ? boardGame[i][j].toggleClue() : false;
                    else if (!loseGame) {
                        if (boardGame[i][j].getStatus() == 0 && !boardGame[i][j].getVisible()) {
                            boardGame[i][j].revealSquare();
                            if (boardGame[i][j].getValue() == 0) revealEmptyArea([i,j]);
                        }
                        loseGame = boardGame[i][j].getVisible() && boardGame[i][j].getValue() == -1;
                        if (loseGame) clearClues();
                    }
                }
            }
        }

        /**
         * 
         */
        const clearClues = function() {
            for (let i = 0; i < boardGame.length; i++) 
                for (let j = 0; j < boardGame.length; j++) 
                    if (boardGame[i][j].getClue()) boardGame[i][j].disableClue();
                    //boardGame[i][j].getClue() ? boardGame[i][j].toggleClue() : false;
        }

        /**
         * Acción principal: destapa y revela una casilla oculta
         * 
         * @param {Number} row    Coordenada fila de la casilla a revelar
         * @param {Number} column Coordenada columna de la casilla a revelar
         */
        const mainAction = function(row,column) {
            const square = boardGame[row][column];
            square.revealSquare();
            if (!square.getVisible()) return;
            !createdBoard ? (insertMines([row,column]), temporizer.togglePause()) : false;
            if (square.getValue() === 0) revealEmptyArea([row,column]);
            square.getValue() === -1 ? loseGame = true : checkWin();
            if (activatedClue) {
                clearClues();
                activatedClue = false;
            }
        }

        /**
         * Acción secundaria: añade o elimina una bandera o interrogante a la casilla sobre la que se ha hecho
         * click con el botón derecho.
         * 
         * @param {Number} row    Coordenada fila de la casilla sobre la que se ejecuta la acción
         * @param {Number} column Coordenada columna de la casilla sobre la que se ejecuta la acción
         */
        const secundaryAction = function(row,column) {
            const square = boardGame[row][column];
            if ( square.getVisible() || winGame || (availableFlags === 0 && square.getStatus() !== 1) ) return;
            square.increaseStatus();
            if (activatedClue) {
                clearClues();
                activatedClue = false;
            }
        }

        /**
         * 
         * 
         * @param {Number} row    Coordenada fila de la casilla sobre la que se ejecuta la acción
         * @param {Number} column Coordenada columna de la casilla sobre la que se ejecuta la acción
         */
        const clueAction = function(row,column) {
            const square = boardGame[row][column];
            if (!square.getVisible() || square.getValue() == 0) return;
            if (square.getValue() == accountFlagsAroundSquare(row,column)) 
                algo(row,column);
            else {
                algo(row,column,true);
                activatedClue = true;
            }
        }

        /**
         * Ejecuta la acción correspondiente al valor del primer parámetro
         * 
         * @param {Number} accion Valor comprendido entre [1-3] que determina la acción a ejecutar:
         *                          1: botón izquierdo
         *                          2: botón derecho
         *                          3: ambos botones
         * @param {Array} param1  Coordenadas [fila,columna] de la casilla afectada
         */
        const executeAction = function(action,[row,column]) {
            const ACTIONS_HANDLER = {
                1: mainAction,
                2: secundaryAction,
                3: clueAction
            }
            ACTIONS_HANDLER[action](row,column);
        }

        /**
         * Acción a realizar sobre una casilla según el botón o botones del ratón que se haya pulsado.
         * 1: botón izquierdo
         * 2: botón derecho
         * 3: ambos botones
         * 
         * @param {Number} action Valor comprendido entre [1-3] que determina la acción a ejecutar:
         *                          1: botón izquierdo
         *                          2: botón derecho
         *                          3: ambos botones
         * @param {Array} param1  Coordenadas [fila,columna] de la casilla afectada
         */
        const action = function(action,[row,column]) {
            if (loseGame || winGame) return;
            if (action < 1 || action > 3) return;
            if (row < 0 || row > boardGame.length - 1 || column < 0 || column > boardGame.length - 1) return;
            executeAction(action,[row,column]);
            loseGame || winGame ? (revealBoardGame(), temporizer.togglePause()) : false;
            availableFlags = recountAvailableFlags();
        }

        return {
            init: init,
            action: action,
            show: showBoardGame,
            getBoardGame: getBoardGame,
            getAvailableFlags: getAvailableFlags,
            getLoseGame: getLoseGame,
            getWinGame: getWinGame,
            getTime: getTime,
        }
    }
)()