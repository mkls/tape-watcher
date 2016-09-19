module.exports = new TestRunner();

function TestRunner() {
    this.state = {
        running: false,
        files: [],
        nextRunScheduled: false,
        nextRunFiles: null
    };
    this.reportCallback = null;

    this.runTests = function (files) {
        if (this.state.running) {
            this.nextRunScheduled = true;
            if (files) {
                this.state.nextRunFiles = files;
            }
            return;
        }

        if (files) {
            this.state.files = files;
        }
        var result = actualRun(files);

        this.reportCallback(result, this.state);
    }

    this.setCallback = function (reportCallback) {
        this.reportCallback = reportCallback;
    }

    function actualRun() {
        return 'hap';
    }
}
