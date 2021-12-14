const gulp = require('gulp');
const pug = require('gulp-pug');
const browserify = require('gulp-browserify');


gulp.task('pug', () => {
	return gulp.src('pug/index.pug')
		.pipe(pug())
		.pipe(gulp.dest('dist'));
});

gulp.task('css', () => {
	return gulp.src('styles/styles.css')
		.pipe(gulp.dest('dist'));
});

gulp.task('img', () => {
	return gulp.src('img/*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('browserify', () => {
	return gulp.src('src/router.js')
		.pipe(browserify())
		.pipe(gulp.dest('dist'));
});

gulp.task('CNAME', () => {
	return gulp.src('CNAME')
		.pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.parallel('pug', 'css', 'img', 'browserify', 'CNAME'));
