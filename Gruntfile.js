/* global module */
module.exports = function(grunt) {
    'use strict';

    // config
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        dir: {
            build: 'dist/'
        },

        // https://github.com/gruntjs/grunt-contrib-concat
        concat: {
            build: {
                src: [
                    'src/_intro',
                    'src/utils.js',
                    'src/observable.js',
                    'src/widget.js',
                    'src/constructor.js',
                    'src/events.js',
                    'src/proto.js',
                    'src/template.js',
                    'src/tooltips.js',
                    'src/google-analytics.js',
                    'src/_outro'
                ],
                dest: '<%= dir.build %>js/tmv.js'
            }
        },

        // https://github.com/gruntjs/grunt-contrib-copy
        copy: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'less/',
                    src: ['**'],
                    dest: '<%= dir.build %>less/'
                }]
            }
        },

        // https://github.com/gruntjs/grunt-contrib-clean
        clean: {
            build: ['<%= dir.build %>']
        },

        // https://github.com/gruntjs/grunt-contrib-jshint
        jshint: {
            options: {
                jshintrc: true
            },
            src: ['src/**/*.js']
        },

        // https://github.com/gruntjs/grunt-contrib-less
        less: {
            build: {
                options: {
                    cleancss: true
                },
                files: {
                    '<%= dir.build %>css/simple-light.css': 'less/themes/simple-light.less',
                    '<%= dir.build %>css/simple-dark.css': 'less/themes/simple-dark.less',
                    '<%= dir.build %>css/green-light.css': 'less/themes/green-light.less',
                    '<%= dir.build %>css/green-dark.css': 'less/themes/green-dark.less',
                    '<%= dir.build %>css/red-light.css': 'less/themes/red-light.less',
                    '<%= dir.build %>css/red-dark.css': 'less/themes/red-dark.less'
                }
            }
        },

        // https://github.com/gruntjs/grunt-contrib-qunit
        qunit: {
            all: ['test/**.html']
        },

        // https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            build: {
                options: {
                    report: 'min',
                    sourceMap: '<%= dir.build %>js/tmv.min.map',
                    sourceMappingURL: 'tmv.min.js'
                },
                files: {
                    '<%= dir.build %>js/tmv.min.js': '<%= dir.build %>js/tmv.js'
                }
            }
        },

        // https://github.com/gruntjs/grunt-contrib-watch
        watch: {}

    });

    // plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // tasks
    grunt.registerTask('default', 'watch');

    grunt.registerTask('test', [
        'qunit'
    ]);

    grunt.registerTask('build', [
        'jshint:src',
        'clean:build',
        'copy:build',
        'less:build',
        'concat:build',
        'uglify:build'
    ]);

    grunt.registerTask('release', [
        'build',
        'test'
    ]);

};
