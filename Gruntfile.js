/* global module, require */

'use strict';

const sass = require('node-sass');

module.exports = function(grunt) {
    'use strict';

    // Time how long it takes to do the Grunt build
    require('time-grunt')(grunt);

    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    /** ********************
     * Grunt configuration
     ******************** **/
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /**
         * Delete files
         * @see: https://www.npmjs.com/package/grunt-contrib-clean
         */
        clean: ['dist/*'],

        /**
         * Lint JS files
         * @see https://www.npmjs.com/package/grunt-eslint
         */
        eslint: {
            src: [
                'Gruntfile.js'
            ]
        },

        /**
         * Lint JSON files
         * @see https://www.npmjs.com/package/grunt-jsonlint
         */
        jsonlint: {
            src: [
                '.eslintrc.json',
                'package-lock.json',
                'package.json'
            ]
        },

        /**
         * Files to concatenate together
         * @see: https://www.npmjs.com/package/grunt-contrib-concat
         */
        concat: {
            js: {
                options: {
                    // define a string to put between each file in the concatenated output
                    separator: ';\n'
                },
                files: [
                    {
                        dest: 'dist/js-staging/main.js',
                        src: [
                            'src/js/mediaelement-and-player.js',
                            'src/js/playlist.js'
                        ],
                        nonull: true
                    }
                ]
            }
        },

        /**
        * Minify HTML Files
        * @see https://www.npmjs.com/package/grunt-contrib-htmlmin
        */
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'src/index.src.html'
                }
            }
        },

        /**
         * Copy files every which where
         * @see https://www.npmjs.com/package/grunt-contrib-copy
         */
        copy: {
            audio: {
                expand: true,
                cwd: 'src',
                src: 'audio/**',
                dest: 'dist/'
            },
            favicons: {
                files: {
                    'dist/favicon.png': 'src/favicon.png'
                }
            },
            images: {
                expand: true,
                cwd: 'src',
                src: 'img/**',
                dest: 'dist/'
            }
        },

        /**
         * Run PostCSS
         * @see: https://www.npmjs.com/package/grunt-postcss
         */
        postcss: {
            options: {
                map: {
                    inline: false
                },
                processors: [
                    require('pixrem')(),
                    require('autoprefixer')({
                        browsers: [
                            'last 2 versions'
                        ]
                    }),
                    require('postcss-combine-duplicated-selectors')(),
                    require('postcss-discard-duplicates')(),
                    require('cssnano')()
                ]
            },
            dist: {
                src: 'dist/**/*.css'
            }
        },

        /**
         * Sass -> CSS compiler (using libsass)
         * @see: https://github.com/gruntjs/grunt-sass
         */
        sass: {
            dist: {
                options: {
                    implementation: sass,
                    includePaths: [
                        'node_modules/'
                    ],
                    precision: 10,
                    outputStyle: 'compressed'
                },
                files: {
                    'dist/css/main.css': 'src/sass/main.scss'
                }
            }
        },

        /**
         * Lint scss files
         * @see https://www.npmjs.com/package/grunt-stylelint
         * @see https://www.npmjs.com/package/stylelint
         */
        stylelint: {
            options: {
                configFile: 'src/sass/.stylelintrc.json',
                failOnError: true,
                syntax: 'scss'
            },
            src: [
                'src/sass/**/*.scss'
            ]
        },

        /*
         * Uglify optimizer / minifier
         * @see https://www.npmjs.com/package/grunt-contrib-uglify
         */
        uglify: {
            options: {
                compress: {},
                sourceMap: true
            },
            js: {
                files: {
                    'dist/js-dist/main.min.js': ['dist/js-staging/main.js']
                }
            }
        },

        /**
         * Watch certain files for changes and react with certain tasks
         * @see https://www.npmjs.com/package/grunt-contrib-watch
         */
        watch: {
            options: {
                event: 'all',
                livereload: true
            },
            css: {
                files: [
                    'node_modules/jamf-brand/src/styles/**/*.scss',
                    'node_modules/jamf-cookie-consent/src/styles/**/*.scss',
                    'src/sass/**/*.scss',
                    'src/sass/.stylelintrc.json'
                ],
                tasks: ['css']
            },
            eslint: {
                files: [
                    '.eslintrc.json',
                    'Gruntfile.js'
                ],
                tasks: ['eslint']
            },
            jsonlint: {
                files: '<%= jsonlint.src %>',
                tasks: ['jsonlint']
            },
            meta: {
                files: [
                    'Gruntfile.js',
                    'package-lock.json',
                    'package.json'
                ],
                tasks: ['default']
            }
        }

    });

    grunt.registerTask('test', [
        'eslint',
        'jsonlint',
        'stylelint'
    ]);

    grunt.registerTask('css', [
        'stylelint',
        'sass',
        'postcss'
    ]);

    grunt.registerTask('html', [
        'htmlmin'
    ]);

    grunt.registerTask('js', [
        'concat',
        'uglify'
    ]);

    /**
     * Task: Default
     *  - Lint all assets becasue I prolly made a typo somewhere
     *  - Clean out old minified files
     *  - Copy images and audio for simplicity's sake
     *  - Minify Source html for ftp
     *  - Minify Source css for ftp
     *  - Minify Source js for ftp
     */
    grunt.registerTask('default', [
        'test',
        'clean',
        'copy',
        'html',
        'css',
        'js'
    ]);

};
