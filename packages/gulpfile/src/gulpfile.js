var babel = require('gulp-babel');
var del = require('del');
var gulp = require('gulp');
var makeDir = require('make-dir');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');

var tsconfig = {
  pretty: true,
  declaration: true,
  declarationMap: true,
  noEmit: false,
  emitDeclarationOnly: true,
  isolatedModules: false,
  plugins: [
    { transform: 'typescript-transform-paths', afterDeclarations: true }
  ]
};

var tsProject = ts.createProject('tsconfig.build.json', tsconfig);

function clean() {
  return del(['dist/**/*']);
}

function assetsdir() {
  return makeDir('src/assets');
}

function assets() {
  return gulp
    .src('src/assets/*.*', { since: gulp.lastRun(assets) })
    .pipe(plumber())
    .pipe(gulp.dest('dist/assets'));
}

function sources() {
  return gulp
    .src('src/**/*.{js,ts,tsx}', { since: gulp.lastRun(sources) })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function declarations() {
  return gulp
    .src('src/**/*.{js,ts,tsx}', { since: gulp.lastRun(declarations) })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .dts.pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function watch() {
  gulp.watch('src/**/*.*', gulp.parallel(assets, sources, declarations));
}

var build = gulp.series(
  clean,
  assetsdir,
  gulp.parallel(assets, sources, declarations)
);

exports.build = build;
exports.watch = watch;
