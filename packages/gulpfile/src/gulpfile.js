var babel = require('gulp-babel');
var del = require('del');
var gulp = require('gulp');
var makeDir = require('make-dir');
var path = require('path');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var ts = require('gulp-typescript');

var tsconfig = {
  pretty: true,
  declaration: true,
  declarationMap: true,
  noEmit: false,
  emitDeclarationOnly: true,
  isolatedModules: false
};

var tsProject = ts.createProject('tsconfig.build.json', tsconfig);

function clean() {
  return del(['dist/**/*']);
}

function unlink(filepath) {
  var sourcePath = path.relative(path.resolve('src'), filepath);
  var outputPath = path.resolve('dist', sourcePath);

  var ext = path.extname(filepath);

  if (['.js', '.ts', '.tsx'].includes(ext)) {
    var filename = path.basename(outputPath, ext);
    var pattern = path.resolve(path.dirname(outputPath), filename + '.*');

    del.sync(pattern);
  } else {
    del.sync(outputPath);
  }
}

function assetsdir() {
  return makeDir('src/assets');
}

function assets() {
  return gulp
    .src('src/assets/**/*.*', { since: gulp.lastRun(assets) })
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

var build = gulp.series(
  clean,
  assetsdir,
  gulp.parallel(assets, sources, declarations)
);

function watch() {
  gulp
    .watch(
      'src/**/*.*',
      { usePolling: true },
      gulp.parallel(assets, sources, declarations)
    )
    .on('unlink', unlink);
}

exports.build = build;
exports.watch = watch;
