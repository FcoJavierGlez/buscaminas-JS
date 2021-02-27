/**
 * @author Francisco Javier González Sabariego
 */
const Square = class {
    constructor() {
        this._status  = 0;  //0 = normal | 1 = flag | 2 = question mark
        this._value   = 0;  //-1 = mine | 0+ = number of mines around it
        this._visible = false;
        this._clue    = false;
    }
    increaseStatus() {
        this._status = this._status === 2 ? 0 : ++this._status;
    }
    revealSquare() {
        if (this._status !== 0) return;
        this._visible = true;
    }
    increaseValue() {
        ++this._value;
    }
    setStatus(newStatus) {
        this._status = newStatus;
    }
    getStatus = function() {
        return this._status;
    }
    setValue(newValue) {
        this._value = newValue;
    }
    getValue = function() {
        return this._value;
    }
    getVisible = function() {
        return this._visible;
    }
    getClue = function() {
        return this._clue;
    }
    toggleClue() {
        this._clue = !this._clue;
    }
}