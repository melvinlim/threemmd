export class Logger {
    constructor() {
        this.timer;
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
    log(msg) {
        if (this.line >= this.lines) {
            this.msgs.shift();
        }
        this.line += 1;
        this.msgs.push(msg);
        let content = '';
        this.msgs.forEach(function (x) {
            content += x + '\n';
        });
        document.getElementById('info').textContent = content;
        window.clearInterval(this.timer);
        this.timer = setInterval(this.clearText, this.textTime);
    }
}