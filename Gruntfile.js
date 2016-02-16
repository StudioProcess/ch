/*!
 * Gruntfile
 */

'use strict';

/**
 * Livereload and connect variables
 */
var LIVERELOAD_PORT = 35729;

/**
 * Grunt module
 */
module.exports = function (grunt) {

	/**
	 * Dynamically load npm tasks
	 */
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


	var pkg = grunt.file.readJSON('package.json');
	var cfg = pkg.config;
   var ftp_cfg = grunt.file.readJSON('.ftpconfig');
   cfg.ftp = ftp_cfg;

  // fully prefix folder and file paths
  cfg.files.jsmin = cfg.files.js.replace(/\.js$/i, '.min.js');
  cfg.files.cssmin = cfg.files.css.replace(/\.css$/i, '.min.css');
  cfg.files.cssprefixed = cfg.files.css.replace(/\.css$/i, '.prefixed.css');

  cfg.folders_full = {
	cwd: cfg.folders.cwd, // stays
	scss: cfg.folders.cwd + '/' + cfg.folders.scss,
	css: cfg.folders.cwd + '/' + cfg.folders.css,
	js: cfg.folders.cwd + '/' + cfg.folders.js
  };

  cfg.files_cwd = {
	scss: cfg.folders.scss + '/' + cfg.files.scss,
	css: cfg.folders.css + '/' + cfg.files.css,
	cssmin: cfg.folders.css + '/' + cfg.files.cssmin,
	cssprefixed: cfg.folders.css + '/' + cfg.files.cssprefixed,
	js: cfg.folders.js + '/' + cfg.files.js,
	jsmin: cfg.folders.js + '/' + cfg.files.jsmin
  };

  cfg.files_full = {
	scss: cfg.folders_full.scss + '/' + cfg.files.scss,
	css: cfg.folders_full.css + '/' + cfg.files.css,
	cssmin: cfg.folders_full.css + '/' + cfg.files.cssmin,
	cssprefixed: cfg.folders_full.css + '/' + cfg.files.cssprefixed,
	js: cfg.folders_full.js + '/' + cfg.files.js,
	jsmin: cfg.folders_full.js + '/' + cfg.files.jsmin
  };


	var log = function(arg) {
		grunt.log.writeln(JSON.stringify(arg));
	};

	// log(cfg.folders_full);
	//  log(cfg.files_full);

	//returns a function that removes a string from the front
	// var removeFront = function(str) {
	// 	return function(src, dest) {
	// 		log(dest);
	// 		if (dest.indexOf(str) !== 0) return dest;
	// 		return dest.substr(0, str.length);
	// 	};
	// };

	/**
	 * Grunt config
	 */
	grunt.initConfig({
		/**
		 * Project configuration
		 */
		 pkg: pkg,
		 cfg: cfg,

		/**
		 * Project banner
		 * Dynamically appended to CSS/JS files
		 * Inherits text from package.json
		 */
		// tag: {
		//   banner: '/*!\n' +
		//           ' * <%= pkg.name %>\n' +
		//           ' * <%= pkg.title %>\n' +
		//           ' * <%= pkg.homepage %>\n' +
		//           ' * @author <%= pkg.author %>\n' +
		//           ' * @version <%= pkg.version %>\n' +
		//           ' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
		//           ' */\n'
		// },

		/**
		 * Clean files and folders
		 * https://github.com/gruntjs/grunt-contrib-clean
		 * Remove generated files for clean deploy
		 */
		// clean: {
		//   dist: [
		//     '<%= project.assets %>/css/style.unprefixed.css',
		//     '<%= project.assets %>/css/style.prefixed.css'
		//   ]
		// },




		/**
		 * Autoprefixer
		 * Adds vendor prefixes automatically
		 * https://github.com/nDmitry/grunt-autoprefixer
		 */
		autoprefixer: {
			// options: {
			// 	browsers: ['> 1%']
			// },
			all: {
				src: ['<%= cfg.files_full.css %>'],
				expand: true,
				ext: '.prefixed.css'
			}
		},

		/**
		 * JSHint
		 * https://github.com/gruntjs/grunt-contrib-jshint
		 * Manage the options inside .jshintrc file
		 */
		jshint: {
		  src: ['<%= cfg.files_full.js %>']
		},

		/**
		 * Uglify (minify) JavaScript files
		 * https://github.com/gruntjs/grunt-contrib-uglify
		 * Compresses and minifies all JavaScript files into one
		 */
		uglify: {
			options: {
				//banner: '<%= tag.banner %>',
				report: 'gzip'
			},
			all: {
				src: '<%= cfg.files_full.js %>',
				expand: true,
				ext: '.min.js'
			}
		},

		copy: {
			js: {
				src: '<%= cfg.files_full.js %>',
				expand: true,
				ext: '.min.js'
			},
			css: {
				src: '<%= cfg.files_full.cssprefixed %>',
				expand: true,
				ext: '.min.css'
			}
		},

		/**
		 * Compile Sass/SCSS files
		 * https://github.com/gruntjs/grunt-contrib-sass
		 * Compiles all Sass/SCSS files and appends project banner
		 */
		sass: {
			all: {
				options: {
					style: 'expanded',
					//banner: '<%= tag.banner %>'
					trace: true
				},
				src: ['<%= cfg.files_full.scss %>'],
				dest: '<%= cfg.files_full.css %>'
			}
		},

		/**
		 * CSSMin
		 * CSS minification
		 * https://github.com/gruntjs/grunt-contrib-cssmin
		 */
		cssmin: {
			options: {
			  //banner: '<%= tag.banner %>',
			  report: 'gzip'
			},
			all: {
				src: '<%= cfg.files_full.cssprefixed %>',
				expand: true,
				ext: '.min.css'
			}
		},

		ftp_push: {
			options: {
				authKey: "<%= cfg.ftp.authKey %>",
				host: "<%= cfg.ftp.host %>",
				port: "<%= cfg.ftp.port %>",
				dest: "<%= cfg.ftp.dest %>",
			},

			all: {
				expand: true,
				cwd: '<%= cfg.folders.cwd %>',
				src: ['**']
			},

			css: {
				expand: true,
				cwd: '<%= cfg.folders.cwd %>',
				src: ['<%= cfg.files_cwd.cssmin %>', '<%= cfg.files_cwd.cssprefixed %>', '<%= cfg.files_cwd.css %>', '<%= cfg.files_cwd.scss %>']
			},

			js: {
				expand: true,
				cwd: '<%= cfg.folders.cwd %>',
				src: ['<%= cfg.files_cwd.jsmin %>', '<%= cfg.files_cwd.js %>']
			},

			other: {
				expand: true,
				cwd: '<%= cfg.folders.cwd %>',
				src: ['!**'] //nothing
			}
		},

		/**
		 * Runs tasks against changed watched files
		 * https://github.com/gruntjs/grunt-contrib-watch
		 * Watching development files and run concat/compile tasks
		 * Livereload the browser once complete
		 */
		watch: {
			options: {
				spawn: false,
				livereload: LIVERELOAD_PORT
			},
			//just upload other files via ftp
			other: {
				files: ['<%= cfg.folders.cwd %>/**/*',
					'!<%= cfg.files_full.scss %>', '!<%= cfg.files_full.css %>', // not the css
					'!<%= cfg.files_full.js %>', '!<%= cfg.files_full.jsmin %>'], // not the js
				tasks: ['ftp_push:other']
			},
			//compile scss file and upload
			scss: {
				files: ['<%= cfg.files_full.scss %>'],
				tasks: ['sass', 'autoprefixer', 'copy:css', 'ftp_push:css'] // cssmin:dev
			},
			//copy .js to min.js
			js: {
				files: ['<%= cfg.files_full.js %>'],
				tasks: ['jshint', 'copy:js', 'ftp_push:js']
			}
		}
	});

	// var changedFiles = Object.create(null);
	// var configPush = grunt.util._.debounce(function() {
	// 	grunt.config('ftp_push.all.src', Object.keys(changedFiles));
	// 	log('configured ftp_push.all.src ' + grunt.config('ftp_push.all.src'));
	// 	changedFiles = Object.create(null);
	// }, 1000);


	// configure ftp_push on watch events
	grunt.event.on('watch', function(action, filepath, target) {
		if (action === 'deleted') return;
		if (target === 'other') {
			//log(arguments);
			// TODO robust removal of
			var len = cfg.folders.cwd.length;
			if (cfg.folders.cwd.substr(-1, 1) !== '/') len = len + 1;
			var file = filepath.substr(len);
			grunt.config('ftp_push.other.src', file);
			//log('configured ftp_push.other.src ' + grunt.config('ftp_push.all.src'));
		};

		//changedFiles[file] = action;
		//configPush();

		// log(grunt.config('debug.all.src'));
		// grunt.config('debug.all.src', file);
		// log(grunt.config('debug.all.src'));
	});



	grunt.registerTask('default', ['watch']);
	grunt.registerTask('pushall', ['ftp_push:all']);
	grunt.registerTask('build', ['sass', 'autoprefixer', 'cssmin', 'jshint', 'uglify']);
	grunt.registerTask('deploy', ['build', 'ftp_push:all']);

};
