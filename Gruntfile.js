module.exports = function (grunt) {
    'use strict';

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
                options: {
                    style: 'nested'
                },
                files: [{
                    expand: true,
                    cwd: 'app/stylesheets/sass',
                    src: ['*.scss'],
                    dest: 'app/stylesheets/css',
                    ext: '.css'
                }]
            }
        },

        watch: {
            sass: {
                files: 'app/stylesheets/**/*.scss',
                tasks: ['sass']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('build', ['sass']);
};
