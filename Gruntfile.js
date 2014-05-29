module.exports = function (grunt) {
    var bannerContent = '/* \n' +
        ' * <%= pkg.name %> v<%= pkg.version %> \n' +
        ' * Author: @<%= pkg.author %> \n' +
        ' * Url: <%= pkg.repository.url %> \n' +
        ' * Licensed under the <%= pkg.license %> license\n' +
        ' */\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            options: {
                jshintrc: true,
                reporter: require('jshint-stylish')
            },
            all: ['app/main.js', 'app/*.js', 'app/collections/*.js', 'app/models/*.js', 'app/views/*.js']
        },

        sass: {
            dist: {
                files: {
                    'app/stylesheets/css/site.css': 'app/stylesheets/sass/site.scss',
                    'app/stylesheets/css/style.css': 'app/stylesheets/sass/style.scss'
                }
            }
        },

        watch: {
            sass: {
                files: 'app/stylesheets/**/*.scss',
                tasks: ['sass']
            }
        },

        cssmin: {
            minify_all: {
                options: {
                    banner: bannerContent,
                    keepSpecialComments: 0
                },
                files: {
                    'app/stylesheets/css/site.min.css': ['app/stylesheets/css/site.css'],
                    'app/stylesheets/css/style.min.css': ['app/stylesheets/css/style.css'],
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'sass:dist']);
    grunt.registerTask('css', ['watch']);
    grunt.registerTask('build', ['cssmin:minify_all']);
};
