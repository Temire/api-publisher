module.exports = function(grunt) {
    "use strict";
    var dirConfig = {
        src: "client",
        local: ".local",
        dist: "dist",
        index: "server/views"
    };

    require('time-grunt')(grunt);
    // Load  all grunt plugins
    require("load-grunt-tasks")(grunt);

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"), // load the package.json
        // specify configuration for each plugin
        dir: dirConfig,
        /**
         * UGLIFY ------------------------------------
         */
        uglify: {
            options: {
                preserveComments: false,
                mangle: true,
                screwIE8: true
            },
            dist: {
                expand: true,
                cwd: "<%= dir.dist %>/scripts",
                dest: "<%= dir.dist %>/scripts",
                src: ["**/*.js"]
            }
        },
        /**
         * BABEL -------------------------------------
         * Transpile the client JavaScript (ES6) to browser-safe JavaScript (ES5)
         */
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "<%= dir.dist %>/scripts/app.js": "<%= dir.dist %>/scripts/app.js"
                }
            },
            dev: {
                expand: true,
                cwd: "<%= dir.src %>/scripts",
                dest: "<%= dir.local %>/scripts",
                src: ["**/*.js"]
            }
        },
        /**
         * COPY --------------------------------------
         */
        copy: {
            dist: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.dist %>",
                src: ["index.html", "favicon.ico", "apublicfile.txt", "images/**/*", "views/**/*", "fonts/**/*"]
            },
            local: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.local %>",
                src: [ "images/**/*", "favicon.ico", "views/**/*", "fonts/**/*" ]
            },
            fa : {
                expand: true,
                cwd: "bower_components/font-awesome/fonts",
                dest: "<%= dir.dist %>/fonts",
                src: ["**/*"]
            },
            ion : {
                expand: true,
                cwd: "bower_components/Ionicons/fonts",
                dest: "<%= dir.dist %>/fonts",
                src: ["**/*"]
            },
            index: {
                src: '<%= dir.dist %>/index.html',
                dest: '<%= dir.index %>/index.ejs',
            },
            indexDev: {
                src: '<%= dir.src %>/index.html',
                dest: '<%= dir.index %>/index-dev.ejs'
            }
        },
        /**
         * CLEAN -------------------------------------
         */
        clean: {
            dist: {
                src: ["<%= dir.dist %>", ".tmp"]
            },
            local: {
                src: ["<%= dir.local %>"]
            },
            tmp: {
                src: ["<%= dir.dist %>/scripts/_tmp"]
            }
        },
        /**
         * ANGULAR ANNOTATE --------------------------
         * ng-annotate tries to make the code safe for minification automatically
         * by using the Angular long form for dependency injection.
         */
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= dir.dist %>/scripts',
                    src: '**/*.js',
                    dest: '<%= dir.dist %>/scripts'
                }]
            }
        }, // End Angular Annotate
        /**
         * LESS --------------------------------------
         * Convert LESS stylesheets into regular CSS
         */
        less: {
            dist: {
                options: {
                    cleancss: true
                },
                files: {
                    '<%= dir.src %>/styles/main.css': '<%= dir.src %>/styles/main.less'
                }
            },
            dev: {
                files: {
                    "<%= dir.local %>/styles/main.css": "<%= dir.src %>/styles/main.less",
                }
            }
        }, // End Less
        /**
         * LIBSASS -----------------------------------
         * https://github.com/sindresorhus/grunt-sass
         */
        sass: {
            options: {
                includePaths: [
                    'bower_components'
                ]
            },
            dist: {
                files: {
                    "<%= dir.src %>/styles/main.css": "<%= dir.src %>/styles/main.scss",
                }
            },
            dev: {
                files: {
                    "<%= dir.local %>/styles/main.css": "<%= dir.src %>/styles/main.scss",
                }
            }
        },
        /**
         * POSTCSS Autoprefixer ----------------------
         * https://github.com/postcss/autoprefixer
         */
        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer')({
                        browsers: ['last 3 versions']
                    })
                ]
            },
            dist: {
                src: [ '<%= dir.dist %>/styles/app.min.css']
            },
            dev: {
                src: [ '<%= dir.src %>/styles/main.css']
            }
        },
        /**
         * PROCESS HTML ------------------------------
         */
        processhtml: {
            options: {},
            files: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.dist %>",
                src: ["index.html"]
            }
        },
        /**
         * WATCH -------------------------------------
         */
        watch: {
            options: {
                livereload: 35734
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= dir.src %>/**/*.html',
                    '<%= dir.src %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                ],
                tasks: ['copy:local']
            },
            scripts: {
                options: {
                    livereload: true
                },
                files: ['<%= dir.src %>/scripts/**/*.js'],
                tasks: ['babel:dev']
            },
            styles: {
                options: {
                    livereload: true
                },
                files: ['<%= dir.src %>/styles/**/*.less'],
                tasks: ['less:dev']
            },
            index: {
                options: {
                    livereload: true
                },
                files: [ '<%= dir.src %>/index.html' ],
                tasks: [ 'copy:indexDev' ]
            }

        }, // End Watch
        /**
         * USEMIN ------------------------------------
         */
        useminPrepare: {
            html: ['<%= dir.src %>/index.html'],
            options: {
                dest: '<%= dir.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },
        usemin: {
            html: ['<%= dir.dist %>/**/*.html'],
            css: ['<%= dir.dist %>/styles/**/*.css'],
            js: ['<%= dir.dist %>/scripts/**/*.js'],
            options: {
                assetsDirs: [
                    '<%= dir.dist %>',
                    '<%= dir.dist %>/images',
                    '<%= dir.dist %>/styles',
                    '<%= dir.dist %>/scripts'
                ],
                patterns: {
                    js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
                }
            }
        },
        /**
         * CSSMIN ------------------------------------
         * https://github.com/gruntjs/grunt-contrib-cssmin
         */
        cssmin: {
            options: {
                keepSpecialComments: '0'
            }
        },
        /**
         * FILE REVISION -----------------------------
         */
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 20
            },
            source: {
                files: [{
                    src: [
                        '<%= dir.dist %>/scripts/*.js',
                        '<%= dir.dist %>/styles/*.css'
                    ]
                }]
            }
        },
        /**
         * ANGULAR CONSTANT --------------------------
         * ng-constant will create an Angular .constant that comprises config variables such as
         * the backend URLs, IDP server location, etc...
         * ===========================================
         * ** OBSOLETE **
         * These settings are now configured via the config.yml in the /config dir
         * They are retained here for reference purposes
         */
        // ngconstant: {
        //     options: {
        //         name: 'app.config',
        //         dest: '<%= dir.src %>/scripts/shared/app.config.js',
        //         wrap: ';(function(angular){\n"use strict";\n\n{%= __ngModule %} \n\n})(window.angular);',
        //         space: '  '
        //     },
        //     docker: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': true,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': true,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://192.168.99.100/dev/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://192.168.99.100/dev/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=username%20name%20avatar%20email%20phone&redirect_uri=localhost:9000&lng=nl'
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_docker-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
        //                     'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
        //                     'SP_URL': 'http://localhost:8080/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'APIEngine-local',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: '192.168.99.100'
        //                 }
        //             }
        //         }
        //     },
        //     local: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': true,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': true,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://devapim.t1t.be/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://devapim.t1t.be/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_local-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
        //                     'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
        //                     'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'APIEngine-DEV',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: 'devapim.t1t.be'
        //                 }
        //             }
        //         }
        //     },
        //     dev: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': true,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': false,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://devapim.t1t.be/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://devapim.t1t.be/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_t1tdev-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '05bac13c95a346cbc6e177d747e038db',
        //                     'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
        //                     'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'APIEngine-DEV',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: 'devapim.t1t.be'
        //                 }
        //             }
        //         }
        //     },
        //     devInt: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': false,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': false,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://devapim.t1t.be/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://devapim.t1t.be/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_t1tdev-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
        //                     'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
        //                     'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'APIEngine-DEV',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: 'devapim.t1t.be'
        //                 }
        //             }
        //         }
        //     },
        //     devExt: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': false,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': true,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://devapim.t1t.be/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://devapim.t1t.be/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_t1tdev-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
        //                     'IDP_URL': 'https://devidp.t1t.be/auth/realms/APIEngine/protocol/saml',
        //                     'SP_URL': 'http://devapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'APIEngine-DEV',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: 'devapim.t1t.be'
        //                 }
        //             }
        //         }
        //     },
        //     acc: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': true,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': true,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://accapim.t1t.be/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://accapim.t1t.be/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_t1tacc-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '05bac13c95a346cbc6e177d747e038db',
        //                     'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
        //                     'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'T1G-ACC',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: 'accapim.t1t.be'
        //                 }
        //             }
        //         }
        //     },
        //     accInt: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': false,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': true,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://accapim.t1t.be/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://accapim.t1t.be/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_t1tacc-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c1',
        //                     'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
        //                     'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'T1G-ACC',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: 'accapim.t1t.be'
        //                 }
        //             }
        //         }
        //     },
        //     accExt: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': false,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': true,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://accapim.t1t.be/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://accapim.t1t.be/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': 'https://api-oauth2-o.antwerpen.be/v1/authorize?response_type=code&client_id=a017ae62-c2e3-4f7b-af22-e689732481e9&service=AStad-AProfiel-v1&scopes=basic,contact&lng=en'
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_t1tacc-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97c3',
        //                     'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
        //                     'SP_URL': 'http://accapi.t1t.be/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'T1G-ACC',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: 'accapim.t1t.be'
        //                 }
        //             }
        //         }
        //     },
        //     t1tprodMkt: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': false,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': true,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://apim.t1t.be/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://apim.t1t.be/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': ''
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_t1tprod-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '6b8406cc81fe4ca3cc9cd4a0abfb97p3',
        //                     'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
        //                     'SP_URL': 'https://api.t1t.be/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'T1G-PROD',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: 'apim.t1t.be'
        //                 }
        //             }
        //         }
        //     },
        //     t1tprodPub: {
        //         constants: {
        //             'CONFIG': {
        //                 'APP': {
        //                     'ORG_FRIENDLY_NAME_ENABLED': true,
        //                     'PUBLISHER_MODE': true,
        //                     'USE_DIGIPOLIS_CONSENT_PAGE': false,
        //                     'SHOW_API_DEVELOPER_NAME_IN_STORE': true,
        //                     'DISABLE_ANNOUNCEMENTS': true,
        //                     'DISABLE_SUPPORT': true
        //                 },
        //                 'BASE': {
        //                     'URL': 'https://apim.t1t.be/apiengine/v1',
        //                     'JWT_HEADER_NAME': 'jwt'
        //                 },
        //                 'AUTH': {
        //                     'URL': 'https://apim.t1t.be/apiengineauth/v1'
        //                 },
        //                 'CONSENT': {
        //                     'URL': ''
        //                 },
        //                 'STORAGE': {
        //                     'LOCAL_STORAGE': 'apim-',
        //                     'SESSION_STORAGE': 'apim_session_t1tprod-'
        //                 },
        //                 'SECURITY': {
        //                     'REDIRECT_URL': '/login/idp/redirect',
        //                     'API_KEY': '05bac13c95a346cbc6e177d747e038db',
        //                     'IDP_URL': 'https://idp.t1t.be/auth/realms/Trust1Gateway/protocol/saml',
        //                     'SP_URL': 'https://api.t1t.be/API-Engine-auth/v1/login/idp/callback',
        //                     'SP_NAME': 'T1G-PROD',
        //                     'CLIENT_TOKEN': 'jwt',
        //                     'WSO2_LOGIN_FIX': false
        //                 },
        //                 KONG: {
        //                     HOST: 'apim.t1t.be'
        //                 }
        //             }
        //         }
        //     },
        // },
        /**
         * REPLACE ----------------------------------- // TODO remove and use config? --> Not needed once MKT and PUB are split
         */
        replace: {
            mkt: {
                src: ['<%= dir.src %>/styles/main.less'],
                overwrite: true,
                replacements: [
                    {
                        from: '@import "theme-t1t.less";',
                        to: '//@import "theme-t1t.less";'
                    }
                ]
            },
            pub: {
                src: ['<%= dir.src %>/styles/main.less'],
                overwrite: true,
                replacements: [
                    {
                        from: '@import "theme-t1t.less";',
                        to: '@import "theme-override.less";'
                    }
                ]
            },
            t1t: {
                src: ['<%= dir.src %>/styles/main.less'],
                overwrite: true,
                replacements: [
                    {
                        from: /\/\/@import "theme-t1t.less";/g,
                        to: '@import "theme-t1t.less";'
                    },
                    {
                        from: '@import "theme-override.less";',
                        to: '@import "theme-t1t.less";'
                    }
                ]
            }
        }, // End Replace
        /**
         * COMPRESS ---------------------------------- // TODO package correct things
         * create zip file of built artifact
         */
        compress: {
            dist: {
                options: {
                    mode: 'zip',
                    archive: function() {
                        var date = new Date();
                        var dateString = date.getFullYear() + ("0"+(date.getMonth()+1)).slice(-2) + ("0" + date.getDate()).slice(-2)
                            + "-" + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
                        return global.task + '-' + dateString + '.zip'
                    }
                },
                expand: true,
                cwd: '<%= dir.dist %>',
                src: ['**/*']
            }
        }, // End Compress
        /**
         * HTMLMIN -----------------------------------
         * Remove comments etc from HTML
         */
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    useShortDoctype: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= dir.dist %>',
                    src: ['*.html', 'views/**/*.html'],
                    dest: '<%= dir.dist %>'
                }]
            }
        }, // End HtmlMin
    });
    // Default Task (that can be run by typing only "grunt" in cmd)
    grunt.registerTask("default", 'build');
    grunt.registerTask("cleanBuild", ["clean:dist"]);
    grunt.registerTask("build", ['clean:dist', 'copy:dist', 'copy:fa', 'copy:ion', 'less:dist', 'useminPrepare', 'cssmin', 'postcss:dist', 'concat', 'ngAnnotate', 'babel:dist', 'uglify', 'filerev', 'usemin', 'htmlmin', 'copy:index']);
    grunt.registerTask("dev", ["less:dev"]);
    grunt.registerTask("html", ["processhtml"]);
    grunt.registerTask('serve', 'Compile then watch for changes to files', function() {
        grunt.task.run(['clean:local', 'copy:local', 'copy:indexDev', 'less:dev', 'babel:dev', 'watch']);
    });
};