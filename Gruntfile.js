module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        compass: {                  // Task
            dist: {                   // Target
                options: {              // Target options
                    httpPath: './',
                    relativeAssets: true,
                    noLineComments: true,
                    sassDir: 'assets/sass',
                    cssDir: 'assets/css',
                    imagesDir: 'assets/images',
                    fontsDir: './assets/fonts',
                    outputStyle: 'expanded'
                }
            }
        },

        cssmin: {
            minify: {
                expand: true,
                cwd: 'assets/css',
                src: ['*.css', '!quick-start.css', '!*min*'],
                dest: 'assets/css',
                ext: '.min.css',
                options: {
                    keepSpecialComments: 0,
                    report: 'min',
                    sourceMap: true,
                    sourceMapFilename: 'assets/css/ink-min.css.map',
                    sourceMapRootpath: '../../'
                }
            }
        },

        clean: {
            css: {
                src: [
                  'assets/css/*.css'
                ]
            },
            csscontrib: [ 'assets/css/contrib' ]
        },

        copy: {
            facss: {
                src: 'assets/css/contrib/font-awesome/font-awesome.css',
                dest: 'assets/css/font-awesome.css'
            }
        },

        watch: {

            options: {
                spawn: false,
            },

            sass: {
                files: ['assets/sass/**/*.scss'],
                tasks: ['compass','cssmin'],
            },
        }

    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-text-replace');

    grunt.registerTask('css', ['clean:css','compass','copy','clean:csscontrib','cssmin']);
    grunt.registerTask('animate', ['replace']);
    grunt.registerTask('default', ['watch']);

};
