module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');

    var siteName = "sloshedfilms.com";

    var webDir = "../" + siteName + "/web/",
        scssDir = webDir + "scss",
        cssDir = webDir + "css";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            scripts: {
                files: [
                    scssDir + '/**/*.scss'
                ],
                tasks: ['compass'],
                options: {
                    spawn: false
                }
            }
        },
        compass: {
            dev: {
                options: {
                    sassDir: scssDir,
                    cssDir: cssDir,
                    noLineComments: true,
                    quite: false,
                    trace: true
                }
            }
        }
    });
    grunt.registerTask('default', ['compass', 'watch']);
}