var compressor = require('../../../../drinking_cinema_back_end/node_modules/node-minify/lib/node-minify');
var webFolder = "../../",
    jsFolder = webFolder + "javascript/",
    cssFolder = webFolder + "css/",
    minJSFolder = jsFolder + "min",
    minCSSFolder = cssFolder + "min",
    globalsFile = "../../../../drinking_cinema_back_end/application/models/globals.php";
var runner = require('child_process');
var fs = require('fs');


var generate_guid = function (guidLength, includeDate) {
    includeDate = typeof includeDate === "boolean" ? includeDate : true;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split(''),
        charsLength = chars.length,
        guid = includeDate ? new Date().getTime() + '_' : '';

    guidLength = guidLength || 16;

    for (var i = 0; i < guidLength; i++) {
        guid += chars[Math.floor(Math.random() * charsLength)];
    }
    return guid;
};

var rmFiles = function(dirPath, oPath) {
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    if (!oPath) oPath = dirPath;
    if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
            var filePath = dirPath + '/' + files[i];
            if (fs.statSync(filePath).isFile())
                fs.unlinkSync(filePath);
            else
                rmDir(filePath, oPath);
        }
    if (dirPath !== oPath) fs.rmdirSync(dirPath);
};

var minify_page = function(pageName, page, guid, callback){
    var fileName = pageName + "-" + guid,
        jsFileName = minJSFolder + "/" + fileName + ".js",
        cssFileName = minCSSFolder + "/" + fileName + ".css";
    // minify the javascript
    var javascripts = [];
    try{
        javascripts = page.javascripts.relativePaths;
    } catch(e){
        console.log("failed to get javascripts for :", pageName);
    }
    var stylesheets = [];
    try{
        stylesheets = page.stylesheets.relativePaths;
    } catch(e) {
        console.log("failed to get stylesheets for :", pageName);
    }

    var jsDone, cssDone;
    var func = function(){
        if (jsDone && cssDone) callback();
    };

    var startTimeJS = new Date().getTime();
    console.log("beginning to compress javascript for ", pageName);

    new compressor.minify({
        type: 'gcc',
        language: 'ECMASCRIPT5',
        publicFolder: jsFolder,
        fileIn: javascripts,
        fileOut: jsFileName,
        callback: function(err, min){
            !err && console.log("compressed javascript for ",pageName,"with gcc in :", (new Date().getTime() - startTimeJS)/1000, "seconds");
            err && console.log(err);
            jsDone = true;
            func();
        }
    });
    var startTimeCSS = new Date().getTime();
    console.log("beginning to compress css for ", pageName);
    console.log(guid, cssFileName);
    new compressor.minify({
        type: 'sqwish',
        publicFolder: cssFolder,
        fileIn: stylesheets,
        fileOut: cssFileName,
        callback: function(err, min){
            !err && console.log("compressed css for ",pageName,"with sqwish in :", (new Date().getTime() - startTimeCSS)/1000, "seconds");
            err && console.log(err);
            cssDone = true;
            func();
        }
    });
}

var editGlobalsFile = function(guid, func){
    var file = fs.readFileSync(globalsFile,'utf8');
    if (file){
        file = file.replace(/(\$script_guid[^\"]+\")([^\"]+)(\".*)/i, function(fullMatch, prev, prevGuid, post){
            console.log (prev+guid+post);
            return prev + guid + post;
        });
    };
    fs.writeFileSync(globalsFile, file, 'utf8');
    func();
}

// remove the min files that already exist
if (!fs.existsSync(minJSFolder)){
    fs.mkdirSync(minJSFolder);
}
if (!fs.existsSync(minCSSFolder)){
    fs.mkdirSync(minCSSFolder);
}
rmFiles(minJSFolder);
rmFiles(minCSSFolder);

runner.exec(
    'php ../../../index.php dependencies',
    function (err, stdout, stderr) {
        var pages = JSON.parse(stdout),
            guid = generate_guid();
        var pageArray = [];
        for (var page in pages){
            pageArray.push({
                pageName: page,
                page: pages[page]
            });
        }
        var func = function(){
            if (!pageArray.length) return;
            var pageObj = pageArray.shift();
            minify_page(pageObj.pageName, pageObj.page, guid, func);
        };
        editGlobalsFile(guid, function(){
            func();
        });


    }
);
