const gulp = require('gulp');
const pug = require('gulp-pug');
//const browserify = require('gulp-browserify');
const browserify = require('browserify');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');


gulp.task('pug', () => {
	return gulp.src('client/pug/index.pug')
		.pipe(pug())
		.pipe(gulp.dest('dist'));
});

gulp.task('css', () => {
	return gulp.src('client/styles/*.css')
		.pipe(concat('styles.css'))
		.pipe(autoprefixer())
		.pipe(csso())
		.pipe(gulp.dest('dist'));
});

gulp.task('img', () => {
	return gulp.src('client/img/*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('browserify', () => {
	return browserify('./client/js/main.js')
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest('./dist'));
});

gulp.task('build', gulp.parallel('pug', 'css', 'img', 'browserify'));


gulp.task('watch', () => {
	gulp.watch('./client/**/*', gulp.series('build'));
});
