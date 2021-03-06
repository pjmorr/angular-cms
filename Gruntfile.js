
/* jshint camelcase:false */
'use strict';
var fs = require('fs'),
		express = require('express'),
		cmsRouter = require('./routes/cms-router.js'),
		config = JSON.parse(fs.readFileSync('./config/config.json')),
		LIVERELOAD_PORT = 35729,
		SERVER_PORT = process.env.PORT || 9000;


var startNodeServer = function(){
	var _app = express();
	var server = new cmsRouter.mount(config, _app);
};

var serverEndpoint = 'http://127.0.0.1:8181';
var proxyConfig = {
	proxy: {
		forward: {
			'/socket.io/*': serverEndpoint,
			'/socket.io': serverEndpoint,
			'/api': serverEndpoint
		}
	}
};


//var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
	return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

	//Connect proxy to route requests to localhost:8181/api
	grunt.loadNpmTasks('grunt-connect-proxy');
	grunt.loadNpmTasks('intern');
	require('json-proxy').initialize({});
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var GruntConfig = {

		// Project settings
		yeoman: {
			// configurable paths
			app: require('./bower.json').appPath || 'app',
			dist: 'www',
			tmp: '.tmp'
		},

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			compass: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
				tasks: ['compass:server', 'autoprefixer']
			},
			styles: {
				files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
				tasks: ['newer:copy:styles', 'autoprefixer']
			},
			scripts: {
				files: ['<%= yeoman.app %>/scripts/{,** /}*.js'],
				tasks: ['jshint:app']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= yeoman.app %>/*.html',
					'<%= yeoman.app %>/views/*.html',
					'.tmp/styles/{,*/}*.css'
				],
				tasks: ['ngtemplates']
			}
		},

		// The actual grunt server settings
		connect: {
			options: {
				port: SERVER_PORT,
				// Change this to '0.0.0.0' to access the server from outside.
				hostname: config.host,
				livereload: LIVERELOAD_PORT,
				base: ['.tmp', '<%= yeoman.app %>'],
				onCreateServer: function(server, connect, options) {
					grunt.util.log('onCreateServer', options);
				}
			},
			livereload: {
				options: {
					open: true,
					base: ['.tmp', '<%= yeoman.app %>'],
					middleware: function (connect, options) {
						startNodeServer(options, connect);
						return [
							require('json-proxy').initialize(proxyConfig),
							mountFolder(connect, '.grunt'),
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'app')
						];
					}
				}
			},
			test: {
				options: {
					port: 9292,
					base: ['.tmp', 'test', '<%= yeoman.app %>']
				}
			},
			dist: {
				options: {
					livereload: false,
					keepAlive: true,
					open: true,
					base: '<%= yeoman.dist %>',
					middleware: function (connect, options) {
						return [
							require('json-proxy').initialize(proxyConfig),
							mountFolder(connect, 'dist')
						];
					}
				}
			},
			docs: {
				options: {
					port: 9191,
					open: true,
					middleware: function (connect, options) {
						return [
							mountFolder(connect, '.grunt'),
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'docs')
						];
					}
				}
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				//'Gruntfile.js'
			],
			app: [
			'<%= yeoman.app %>/scripts',
			'!<%= yeoman.app %>/scripts/libs'
			]
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [
					{
						dot: true,
						src: ['.tmp', '<%= yeoman.dist %>/*', '!<%= yeoman.dist %>/.git*']
					}
				]
			},
			server: '.tmp'
		},

		// Add vendor prefixed styles
		autoprefixer: {
			options: {
				browsers: ['last 1 version']
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: '.tmp/styles/',
						src: '{,*/}*.css',
						dest: '.tmp/styles/'
					}
				]
			}
		},

		// Compiles CoffeeScript to JavaScript
		coffee: {
			options: {
				sourceMap: true,
				bare: true,
				sourceRoot: ''
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.app %>/scripts',
						src: '{,*/}*.coffee',
						dest: '.tmp/scripts',
						ext: '.js'
					}
				]
			},
			test: {
				files: [
					{
						expand: true,
						cwd: 'test',
						src: '{,**/}*.{coffee,litcoffee,coffee.md}',
						dest: '.tmp',
						ext: '.js'
					}
				]
			},
			e2e: {
				files: [
					{
						expand: true,
						cwd: 'test/e2e',
						src: '{,*/}*.coffee',
						dest: '.tmp/e2e',
						ext: '.js'
					}
				]
			},
			routes: {
				files: [
					{
						expand: true,
						cwd: 'routes',
						src: '{,*/}*.coffee',
						dest: '.tmp/routes',
						ext: '.js'
					}
				]
			}
		},

		// Compiles Sass to CSS and generates necessary files if requested
		compass: {
			options: {
				sassDir: '<%= yeoman.app %>/styles',
				cssDir: '.tmp/styles',
				generatedImagesDir: '.tmp/images/generated',
				imagesDir: '<%= yeoman.app %>/images',
				javascriptsDir: '<%= yeoman.app %>/scripts',
				fontsDir: '<%= yeoman.app %>/styles/fonts',
				importPath: '<%= yeoman.app %>/bower_components',
				httpImagesPath: '/images',
				httpGeneratedImagesPath: '/images/generated',
				httpFontsPath: '/styles/fonts',
				relativeAssets: false,
				assetCacheBuster: false
			},
			dist: {
				options: {
					generatedImagesDir: '<%= yeoman.dist %>/images/generated'
				}
			},
			server: {
				options: {
					debugInfo: true
				}
			}
		},

		// Renames files for browser caching purposes
		rev: {
			dist: {
				files: {
					src: [
						'<%= yeoman.dist %>/scripts/{,*/}*.js',
						'<%= yeoman.dist %>/libs/{,*/}*.js',
						'<%= yeoman.dist %>/styles/{,*/}*.css',
						//'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
						'<%= yeoman.dist %>/styles/fonts/*'
					]
				}
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			html: '<%= yeoman.app %>/index.html',
			options: {
				dest: '<%= yeoman.dist %>'
			}
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			html: ['<%= yeoman.dist %>/{,*/}*.html'],
			css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
			options: {
				assetsDirs: ['<%= yeoman.dist %>']
			}
		},

		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.app %>/images',
						src: '{,*/}*.{png,jpg,jpeg,gif}',
						dest: '<%= yeoman.dist %>/images'
					}
				]
			}
		},
		svgmin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.app %>/images',
						src: '{,*/}*.svg',
						dest: '<%= yeoman.dist %>/images'
					}
				]
			}
		},
		htmlmin: {
			dist: {
				options: {
					// Optional configurations that you can uncomment to use
					// removeCommentsFromCDATA: true,
					// collapseBooleanAttributes: true,
					// removeAttributeQuotes: true,
					// removeRedundantAttributes: true,
					// useShortDoctype: true,
					// removeEmptyAttributes: true,
					// removeOptionalTags: true
					/*
					 collapseBooleanAttributes:      true,
					 collapseWhitespace:             false,
					 removeAttributeQuotes:          true,
					 removeComments:                 true, // Only if you don't use comment directives!
					 removeEmptyAttributes:          true,
					 removeRedundantAttributes:      true,
					 removeScriptTypeAttributes:     true,
					 removeStyleLinkTypeAttributes:  true
					 */

				},
				files: [
					{
						expand: true,
						cwd: '<%= yeoman.app %>',
						src: ['*.html', 'views/*.html'],
						dest: '<%= yeoman.dist %>'
					}
				]
			}
		},

		//Less
		less: {
			development: {
				options: {
					paths: ["cms-content/themes"]
				},
				files: {
					".tmp/cms-content/themes/**/*": "<%= yeoman.app %>/cms-content/themes/**/*"
				}
			},
			production: {
				options: {
					paths: ["assets/css"],
					cleancss: true
				},
				files: {
					".tmp/cms-content/themes/**/*.css": "<%= yeoman.app %>/cms-content/themes/**/*.less"
				}
			}
		},

		// Allow the use of non-minsafe AngularJS files. Automatically makes it
		// minsafe compatible so Uglify does not destroy the ng references
		ngmin: {
			dist: {
				files: [
					{
						expand: true,
						cwd: '.tmp/concat/scripts',
						src: '*.js',
						dest: '.tmp/concat/scripts'
					}
				]
			}
		},

		// Replace Google CDN references
		cdnify: {
			dist: {
				html: ['<%= yeoman.dist %>/*.html']
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [
					{
						expand: true,
						dot: true,
						cwd: '<%= yeoman.app %>',
						dest: '<%= yeoman.dist %>',
						src: [
							'*.{ico,png,txt}', '.htaccess',
							//'bower_components/**/*',
							'images/{,*/}*.{webp}',
							'fonts/*'
						]
					},
					{
						expand: true,
						cwd: '.tmp/images',
						dest: '<%= yeoman.dist %>/images',
						src: ['generated/*']
					}
				]
			},
			styles: {
				expand: true,
				cwd: '<%= yeoman.app %>/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
		},

		// Run some tasks in parallel to speed up the build process
		concurrent: {
			options: {
				limit: 15,
				logConcurrentOutput: true
			},
			server: [
				'coffee:dist',
				//	'compass:server',
				'ngtemplates',
				'copy:styles'
			],
			test: [
				'coffee',
				'copy:styles'
			],
			dist: [
				'coffee',
				'ngtemplates',
				'copy:styles',
				//'copy:dist',
				'svgmin',
				'imagemin',
				'htmlmin'
			]
		},

		// By default, your `index.html`'s <!-- Usemin block --> will take care of
		// minification. These next options are pre-configured if you do not wish
		// to use the Usemin blocks.
		// cssmin: {
		//   dist: {
		//     files: {
		//       '<%= yeoman.dist %>/styles/main.css': [
		//         '.tmp/styles/{,*/}*.css',
		//         '<%= yeoman.app %>/styles/{,*/}*.css'
		//       ]
		//     }
		//   }
		// },
		// uglify: {
		//   dist: {
		//     files: {
		//       '<%= yeoman.dist %>/scripts/scripts.js': [
		//         '<%= yeoman.dist %>/scripts/scripts.js'
		//       ]
		//     }
		//   }
		// },
		// concat: {
		//   dist: {}
		// },

		// Test settings
		karma: {
			unit: {
				configFile: 'karma.conf.js',
				singleRun: true
			},
			e2e: {
				configFile: 'karma-e2e.conf.js',
				singleRun: true
			}
		},
		jasmine_node: {
			options: {
				coffee: true,
				match: '.',
				matchall: true,
				extensions: '.js',
				specNameMatcher: 'Spec', // load only specs containing specNameMatcher
				projectRoot: '.',
				requirejs: false,
				forceExit: true,
				jUnit: {
					report: false,
					savePath: './build/reports/jasmine/',
					useDotNotation: true,
					consolidate: true
				}
			},
			all: ['test/routes/']
		},

		//Generate angularjs docs
		ngdocs: {
			options: {
				dest: 'docs',
				html5Mode: false,
				startPage: '/api',
				title: 'AngularCMS Docs',
				titleLink: '/api',
				bestMatch: true
			},
			api: {
				src: [
					'<%= yeoman.app %>/scripts/**/*.js',
					'!.tmp/spec/**/*.js'
				],
				title: 'API'
			},
			tutorial: {
				src: ['content/tutorial/*.ngdoc', 'content/*.ngdoc'],
				title: 'Tutorial'
			},
		},

		//https://npmjs.org/package/grunt-angular-templates
		ngtemplates: {
			app: {
				src: '<%= yeoman.app %>/views/**/*.html',
				dest: '.tmp/scripts/templates.js',
				options: {
					module: 'angularCmsApp',
					url: function (url) {
						return url.replace('app/', '');
					},
					prefix: '',
					htmlmin: {
						collapseWhitespace: true,
						collapseBooleanAttributes: true
					}
					//  usemin: 'dist/vendors.js' // <~~ This came from the <!-- build:js --> block
				}
			}
		},

		/* ======================[ @TODO: Bower Install ]====================== */
		'bower-install': {
			app: {
				src: ['<%= yeoman.app %>/index.html'],
				cwd: '',
				ignorePath: '',
				exclude: [],
				fileTypes: {}
			}
		},

		//Protractor webdriver & protractor
		protractor_webdriver: {
			test: {
				options: {
					command: 'webdriver-manager start'
				}
			}
		},
		protractor: {
			options: {
				keepAlive: true, // If false, the grunt process stops when the test fails.
				noColor: false, // If true, protractor will not use colors in its output.
				args: {}
			},
			test: {
				options: {
					configFile: "protractor.conf.js",
					args: {}
				}
			}
		},

		//Coveralls code coverage
		coveralls: {
			options: {
				debug: true,
				coverageDir: 'coverage',
				dryRun: true,
				force: true,
				recursive: true
			}
		},
		// Configure a mochaTest task
		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					//captureFile: 'results.txt', // Optionally capture the reporter output to a file
					quiet: false,
					clearRequireCache: false
				},
				src: [
					'test/routes/*-spec.js'
				]
			}
		},
		intern: {
			test: {
				options: {
					runType: 'client',
					config: 'test/intern.conf',
					reporters: [ 'console' ],
					suites: []
				}
			}
		}
	};

	// Define the configuration for all the tasks
	grunt.initConfig(GruntConfig);

	grunt.registerTask('serve', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run(['clean:server', 'concurrent:server', 'autoprefixer', 'connect:livereload', 'watch']);
	});

	grunt.registerTask('server', function () {
		grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
		grunt.task.run(['serve']);
	});

	grunt.registerTask('test', function (target) {
		grunt.task.run(['clean:server', 'concurrent:test', 'autoprefixer', 'connect:test']);
		if (target === 'e2e') {
			return grunt.task.run(['karma', 'protractor_webdriver', 'protractor', 'coveralls']);
		} else if (target === 'server') {
			return grunt.task.run(['coffee:test', 'mochaTest']);
		} else {
			return grunt.task.run(['karma:unit', 'coveralls']);
		}
	});
	
	grunt.registerTask('build', [
		'clean:dist',
		'useminPrepare',
		'concurrent:dist',
		'autoprefixer',
		'concat',
		'ngmin',
		'ngtemplates',
		'copy:dist',
		//'cdnify',
		'cssmin',
		'uglify',
		'rev',
		'usemin'
	]);

	grunt.registerTask('ptor', ['coffee:test', 'protractor_webdriver', 'protractor']);
	grunt.registerTask('build-docs', ['useminPrepare', 'autoprefixer', 'concat', 'ngmin']);
	grunt.registerTask('docs', ['coffee', 'ngdocs', 'connect:docs', 'watch:scripts']);
	grunt.registerTask('default', ['newer:jshint', 'test', 'build']);

	grunt.registerTask('heroku:production', 'build');
	grunt.registerTask('heroku:development', 'build');
};
