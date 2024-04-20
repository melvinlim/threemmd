export class Logger {
    constructor() {
        this.timer = undefined;
        this.line = 0;
        this.lines = 10;
        this.msgs = [];
        this.textTime = 5000;   //milliseconds to display text.
    }
    clearText() {
        this.msgs = [];
        this.line = 0;
        document.getElementById('info').textContent = '';
    }
    error(msg) {
        console.error(msg);
        document.getElementById('info').style.color = '#FF0000';
        this._log(msg);
    }
    log(msg) {
        console.log(msg);
        document.getElementById('info').style.color = '#FFFFFF';
        this._log(msg);
    }
    _log(msg) {
        window.clearInterval(this.timer);
        if (this.line >= this.lines) {
            this.msgs.shift();
        }
        this.line += 1;
        const date = new Date();
        msg = Math.floor(date.getTime() / 1000) + ':' + msg;
        this.msgs.push(msg);
        let content = '';
        this.msgs.forEach(function (x) {
            content += x + '\n';
        });
        document.getElementById('info').textContent = content;
        this.timer = setTimeout(this.clearText, this.textTime);
    }
}