const $ = require('gulp');
const $changed = require('gulp-changed');
const $htmlmin = require('gulp-htmlmin');
const $jsonminify = require('gulp-jsonminify');
const $mustache = require('gulp-mustache');
const $plumber = require('gulp-plumber');
const $postcss = require('gulp-postcss');
const $rename = require('gulp-rename');

const del = require('del');
const server = require('browser-sync').create();

$.task('build', $.series(clean, $.parallel(pages, styles, images)));
$.task('default', $.series('build', $.parallel(serve, watch)));
$.task('publish', publish);

function clean() {
  return del(['build']);
}

function reload(done) {
  server.reload();
  done();
}

function watch() {
  $.watch('src/css/*.css', $.series(styles, reload));
  $.watch(['src/img/*'], $.series(images, reload));
  $.watch(['src/*.mustache' ,'src/data/*.json'], $.series(pages, reload));
}

function serve(done) {
  server.init({server: 'build'});
  done();
}

function pages() {
  return $.src(['src/index.mustache'])
      .pipe($changed('build', {extention: ".html"}))
      .pipe($plumber())
      .pipe($mustache('src/data/anime.json', {}, {}))
      .pipe($rename(function(path) {
        path.extname = '.html';
      }))
      .pipe($htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        removeEmptyAttributes: true,
        minifyJS: true,
        minifyCSS: true
      }))
      .pipe($.dest('build'));
}

function styles() {
  return $.src(['src/css/style.css'])
      .pipe($changed('build'))
      .pipe($plumber())
      .pipe($postcss([
        require('precss'), require('cssnano')({
          autoprefixer: {browsers: ['last 2 version'], add: true},
          discardComments: {removeAll: true}
        })
      ]))
      .pipe($.dest('build'));
}

function images() {
  return $.src('*src/img/**/*').pipe($changed('build')).pipe($.dest('build/'));
}

function publish() {
  return $.src('./build/**/*').pipe($.dest('docs/'));
}
