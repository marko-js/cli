var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

function ServerContext(component, tagPath) {
    this.tagPath = tagPath;
    this.component = component;
}

ServerContext.prototype = {
    renderString: function(data) {
        var htmlString;
        var snapshotDir;
        var snapshotFile;

        if(this.component.renderSync) {
            htmlString = this.component.renderSync(data);
        } else {
            htmlString = this.component.render(data).toString();
        }

        if(!this.test.snapshots) {
            this.test.snapshots = 0;
        }

        snapshotFile = this.test.name+'.'+(this.test.snapshots++)+'.html'
        snapshotDir = path.join(this.tagPath, './test/snapshots');

        if(!fs.existsSync(snapshotDir)) {
            fs.mkdirSync(snapshotDir)
        }

        fs.writeFileSync(path.join(snapshotDir, snapshotFile), htmlString);

        return htmlString;
    },
    renderDOM: function(data) {
        return cheerio.load(this.renderString(data));
    }
};

module.exports = ServerContext;