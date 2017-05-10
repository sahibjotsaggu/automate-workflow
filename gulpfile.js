var gulp = require('gulp');
var sass = require('gulp-sass');
var bSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

// task for converting sass files to css
gulp.task('sass', function() {
	return gulp.src('app/scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('app/css'))
		.pipe(bSync.reload({
			stream: true
		}));
});

// task for optimizing images
gulp.task('images', function() {
	return gulp.src('app/images/**/*.+(png|jpg|gif|svg|ico)')
		.pipe(cache(imagemin({
			interlaced: true
		})))
		.pipe(gulp.dest('dist/images'));
});

// task for moving fonts to dist
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  	.pipe(gulp.dest('dist/fonts'));
});

// task for optimizing images for github pages
gulp.task('images_for_gh', function() {
	return gulp.src('app/images/**/*.+(png|jpg|gif|svg|ico)')
		.pipe(cache(imagemin({
			interlaced: true
		})))
		.pipe(gulp.dest('images'));
});

// task for moving fonts to root fonts/ folder for github pages
gulp.task('fonts_for_gh', function() {
  return gulp.src('app/fonts/**/*')
  	.pipe(gulp.dest('fonts'));
});

// task for starting browser-sync
gulp.task('bSync', function() {
	bSync.init({
		server: {
			baseDir: 'app'
		}
	});
});

// task for parsing build blocks in html files
// minify js and css files
gulp.task('useref', function() {
	return gulp.src('app/*.html')
		.pipe(useref())
		// Minifies only if it's a js file
		.pipe(gulpIf('*.js', uglify()))
		// Minifies only if it's a css file
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'));
});

// task for cleaning dist folder
gulp.task('clean:dist', function() {
  return del.sync('dist');
});

// task for clearing the cache (for images)
gulp.task('cache:clear', function (callback) {
	return cache.clearAll(callback);
});

// task for parsing build blocks in html files
// minify js and css files
// move to root folder for use with github pages
gulp.task('useref_for_gh', function() {
	return gulp.src('app/*.html')
		.pipe(useref())
		// Minifies only if it's a js file
		.pipe(gulpIf('*.js', uglify()))
		// Minifies only if it's a css file
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest(''));
});

// task for building project for use with github pages
gulp.task('build_for_gh', function(callback) {
	runSequence('useref_for_gh', 'images_for_gh', 'fonts_for_gh', callback);
});

// run 'bSync' task before running the watch tasks
gulp.task('watch', ['bSync', 'sass'], function() {
	// watch the scss folder for any changes in the scss files and run the 'sass' task
	gulp.watch('app/scss/*.scss', ['sass']);
	// watch the app folder for any changes to any .html files and reload the browser
	gulp.watch('app/*.html', bSync.reload);
	// watch the app/js folder for any changes to any .js files and reload the browser
	gulp.watch('app/js/**/*.js', bSync.reload);

});

gulp.task('default', function(callback) {
	runSequence(['sass', 'bSync', 'watch'], callback);
});

gulp.task('build', function(callback) {
	runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'], callback);
});
