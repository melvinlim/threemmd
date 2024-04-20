export class Logger {
    constructor() {
        this.line = 0;
        this.lines = 10;
        this.msgs = [];
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
    }
}