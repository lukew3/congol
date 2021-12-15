const gulp = require('gulp');
const pug = require('gulp-pug');
const browserify = require('gulp-browserify');


gulp.task('pug', () => {
	return gulp.src('client/pug/index.pug')
		.pipe(pug())
		.pipe(gulp.dest('dist'));
});

gulp.task('css', () => {
	return gulp.src('client/styles/styles.css')
		.pipe(gulp.dest('dist'));
});

gulp.task('img', () => {
	return gulp.src('client/img/*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('browserify', () => {
	return gulp.src('client/js/main.js')
		.pipe(browserify())
		.pipe(gulp.dest('dist'));
});

gulp.task('CNAME', () => {
	return gulp.src('client/CNAME')
		.pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.parallel('pug', 'css', 'img', 'browserify', 'CNAME'));
