var compressor = require('../../../../drinking_cinema_back_end/node_modules/node-minify/lib/node-minify');
var jsFolder = "../../javascript/";

var files = ["test1.js","test2.js"];

// Using google closure
new compressor.minify({
    type: 'gcc',
    publicFolder: jsFolder,
    fileIn: files,
    fileOut:'../test-min.js',
    callback: function(err, min){
        console.log("compressed with gcc");
        console.log(err);
    }
})
