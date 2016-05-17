/*
	"npm link gulp" to link global gulp on windows

	Supports 3 Gulp tasks
		# gulp 			// Compiler
		# gulp watch	// Watches
		# gulp sync 	// Browser Sync + Watch
		# gulp server   // Starts the server
		# gulp zip 		// Creates an updateable zip
	Supports 5 private Gulp tasks
		# gulp _vue 		// Vueify
		# gulp _js 		// Copies JS
		# gulp _css 		// Copies CSS
		# gulp _html 	// Copies HTML
		# gulp _sass 	// Compiles SCSS and Copies CSS
*/
var INPUT_DIR =  'src';
var OUTPUT_DIR = 'public/webapp';
var SERVER_DIR = "server";

var fs = require("fs");
var zip = require('gulp-zip');
var fs = require("fs");
var mkpath = require('mkpath');
var browserify = require('browserify');
var autoprefixer = require('gulp-autoprefixer');
var vueify = require('vueify');
var gulp = require('gulp');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var nodemon = require('nodemon');

// apply custom config
vueify.compiler.applyConfig({
  // configure a built-in compiler
  //sass: {
  //  includePaths: [...]
  //},
  // configure autoprefixer
  autoprefixer: {
    browsers: ['last 2 versions']
  }
});

gulp.task('default', function () {
  runSequence(['_vue','_css','_html','_js','_sass'])
});

gulp.task('watch', function(){
  runSequence(['default'])
  gulp.watch( INPUT_DIR + '/css/**/*.css', ['_css','_syncReload']);
  gulp.watch( INPUT_DIR + '/scss/**/*.scss', ['_sass','_syncReload']);
  gulp.watch( INPUT_DIR + '/js/**/*.js', ['_js','_syncReload']);
  gulp.watch( INPUT_DIR + '/**/*.js', ['_vue','_syncReload']);
  gulp.watch( INPUT_DIR + '/**/**/*.vue', ['_vue','_syncReload']);
  gulp.watch( INPUT_DIR + '/*.html', ['_html','_syncReload']);
});

gulp.task('sync', function(){
	var rootFolder = OUTPUT_DIR.substr(0,OUTPUT_DIR.lastIndexOf("/"));
	browserSync({
		 files: [
		 	OUTPUT_DIR + '/**/*.js',
		 	OUTPUT_DIR + '/**/*.json',
		 	OUTPUT_DIR + '/**/*.css',
		 	OUTPUT_DIR + '/*.html'
		 ],
		 server: {
		 	baseDir: OUTPUT_DIR
		 },
		 proxy: false,
		 open: false
	});
	 runSequence(['watch']);
});

gulp.task('_syncReload', function() {
 browserSync.reload({
      stream: true
    });
});

gulp.task('_vue', function(){
	mkpath(OUTPUT_DIR + '/js', function (err) {
   		if (err) console.log('Directory structure not created');
   		browserify( INPUT_DIR + '/app.js')
   		.on('error', logError)
	  	.transform(vueify)
	  	.on('error', logError)
	  	.bundle()
	  	.on('error', logError)
	  	.pipe(fs.createWriteStream(OUTPUT_DIR + '/js/build.js'));
	});
});

gulp.task('_css', function(){
	gulp.src( INPUT_DIR + '/css/**/*.css')
	.pipe(autoprefixer('last 2 version', 'i.e. 9', 'iOS 6'))
    .pipe(gulp.dest(OUTPUT_DIR + '/css'));
});

gulp.task('_js', function(){
	gulp.src( INPUT_DIR + '/js/**/*.js')
    .pipe(gulp.dest(OUTPUT_DIR + '/js'));
});

gulp.task('_html', function(){
	gulp.src( INPUT_DIR + '/**/*.html')
    .pipe(gulp.dest(OUTPUT_DIR + ''));
});

gulp.task('_sass', function() {
  return gulp.src( INPUT_DIR + '/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(gulp.dest(OUTPUT_DIR + '/css'))
});

// start our server and listen for changes
gulp.task('server', function() {
    // configure nodemon
    nodemon({
        // the script to run the app
        script: SERVER_DIR + '/connect-server.js',
        // this listens to changes in any of these files/routes and restarts the application
        watch: [SERVER_DIR + '/connect-server.js', SERVER_DIR + '/public/*', SERVER_DIR + '/public/*/**'],
        ext: 'js'
    });
});

//Creates an updateable zip
gulp.task('zip', function () {
	var rootFolder = OUTPUT_DIR.substr(0,OUTPUT_DIR.lastIndexOf("/"));
	var d = new Date();
	var zipFile = './'+ rootFolder +'/update.zip';
	var versionFile = "./" + rootFolder + "/version.json";
	versionNumber = 1.0;
	try{
		var vers = require(versionFile);
		var versionNumber = vers.version;
		versionNumber = versionNumber + 0.01;
	}catch(e){}
		fs.writeFileSync(versionFile, '{ \n\t"version": ' + versionNumber + ',\n\t' + '"modified":' + d.getTime() + "\n }", "UTF-8");
		fs.exists(zipFile, function(exists) {
								if(exists == true) {
									fs.unlink(zipFile);
								}
								  gulp.src('./'+ rootFolder +'/**')
									.pipe(zip(zipFile))
									.pipe(gulp.dest('./'));
							});
	});

function logError(error) {

  // If you want details of the error in the console
  console.log(error.toString());

  this.emit('end');
}
