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

        clean: {
            beforebuild: {
                src: ['dist/']
            }
        },

        requirejs: {
            compile: {
                options: {
                    buildFile: 'app.build.js',
                    optimize: 'uglify2',
                    logLevel: 1
                }
            },
        },

        sass: {
            dev: {
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
            },
            dist: {
                options: {
                    style: 'compressed'
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
                tasks: ['sass:dev']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('build', ['sass:dist', 'clean:beforebuild', 'requirejs']);
};
