module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        compass: {                  // Task
            dist: {                   // Target
                options: {              // Target options
                    httpPath: './',
                    relativeAssets: true,
                    sassDir: 'assets/sass',
                    cssDir: 'assets/css',
                    imagesDir: 'assets/images',
                    fontsDir: './assets/fonts',
                    outputStyle: 'expanded'
                }
            }
        },

        cssmin: {
            options: {
                keepSpecialComments: 0,
                report: 'gzip'
            },
            minify: {
                src: ['assets/css/app.css'],
                dest: 'assets/css/app.min.css',
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
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-text-replace');

    grunt.registerTask('css', ['compass','cssmin']);
    grunt.registerTask('animate', ['replace']);
    grunt.registerTask('default', ['watch']);

};
