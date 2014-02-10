/* global module */
module.exports = function(grunt) {
    'use strict';

    // config
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        meta: {
            banner: '/*! <%= pkg.description %> - v<%= pkg.version %> */'
        },

        dir: {
            build: 'dist/'
        },

        // https://github.com/gruntjs/grunt-contrib-compress
        compress: {
            build: {
                options: {
                    archive: '<%= dir.build %>/<%= pkg.name %>-<%= pkg.version %>.zip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.build %>',
                    src: ['**/*'],
                    dest: '.'
                }]
            }
        },

        // https://github.com/gruntjs/grunt-contrib-concat
        concat: {
            build: {
                options: {
                    banner: '<%= meta.banner %>'
                },
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
                    'src/message-dialog.js',
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
            build: ['<%= dir.build %>'],
            docs: ['docs/']
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

        // https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            build: {
                options: {
                    banner: '<%= meta.banner %>',
                    report: 'min',
                    sourceMap: '<%= dir.build %>js/tmv.min.map',
                    sourceMappingURL: 'tmv.min.map'
                },
                files: {
                    '<%= dir.build %>js/tmv.min.js': '<%= dir.build %>js/tmv.js'
                }
            }
        },

        // https://github.com/gruntjs/grunt-contrib-watch
        watch: {},

        // https://github.com/gruntjs/grunt-contrib-yuidoc
        yuidoc: {
            build: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                options: {
                    paths: 'src/',
                    outdir: '<%= dir.build %>docs/'
                }
            }
        }

    });

    // plugins
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    // tasks
    grunt.registerTask('default', 'watch');

    grunt.registerTask('test', [
        'jshint:src'
    ]);

    grunt.registerTask('build', [
        'test',
        'copy:build',
        'less:build',
        'concat:build',
        'uglify:build',
        'yuidoc:build'
    ]);

};
