export class Logger {
    constructor() {
    }
    log(msg) {
        document.getElementById('info').textContent = msg;
    }
}