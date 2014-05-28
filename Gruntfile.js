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

        cssmin: {
            minify_all: {
                options: {
                    banner: bannerContent,
                    keepSpecialComments: 0
                },
                files: {
                    'app/stylesheets/site.min.css': ['app/stylesheets/site.css'],
                    'app/stylesheets/style.min.css': ['app/stylesheets/style.css'],
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'cssmin:minify_all']);
};
