// require Gulp plugin
var autoprefixer    = require('gulp-autoprefixer');
var browserSync     = require('browser-sync');
var concat          = require('gulp-concat');
var csso            = require('gulp-csso');
var ejs             = require('gulp-ejs');
var gulp            = require('gulp');
var htmlmin         = require('gulp-htmlmin');
var imagemin        = require('gulp-imagemin');
var jpegRecompress  = require('imagemin-jpeg-recompress');
var plumber         = require('gulp-plumber');
var pngquant        = require('imagemin-pngquant');
var runSequence     = require('run-sequence');
var sass            = require('gulp-sass');
var uglify          = require('gulp-uglify');
var watch           = require('gulp-watch');

// parse config.json
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json'));

gulp.task('build:template', function() {
  return gulp.src([
          config.dir.src + '/templates/**/*.ejs',
    '!' + config.dir.src + '/templates/**/_*.ejs'
  ])
    .pipe(plumber())
    .pipe(ejs(config, {
      ext: '.html'
    }))
    .pipe(htmlmin({
      'collapseBooleanAttributes': true,
      'collapseInlineTagWhitespace': true,
      'collapseWhitespace': true,
      'minifyCSS': true,
      'minifyJS': true,
      'removeAttributeQuotes': true,
      'removeComments': true,
      'removeRedundantAttributes': true,
      'removeScriptTypeAttributes': true,
      'removeStyleLinkTypeAttributes': true,
      'sortAttributes': true,
      'sortClassName': true,
      'useShortDoctype': true
    }))
    .pipe(gulp.dest(config.dir.dist));
});

gulp.task('build:style', function() {
  return gulp.src(config.dir.src + '/styles/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
      browser: [
        'last 1 version',
        'iOS >= 7',
        'Android >= 4',
        'ie >= 9'
      ]
    }))
    .pipe(csso())
    .pipe(gulp.dest(config.dir.dist));
});

gulp.task('build:script', function() {
  return gulp.src([config.dir.src + '/scripts/vendor/**/*.js', config.dir.src + '/scripts/**/*.js'])
    .pipe(plumber())
    .pipe(concat('script.js'))
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(gulp.dest(config.dir.dist));
});

gulp.task('build:image', function() {
  return gulp.src(config.dir.src + '/images/**/*.{png,jpg,gif,svg}')
    .pipe(imagemin({
      optimizationLevel: 7,
      use: [
        pngquant({
          quality: '60-80',
          speed: 1
        }),
        jpegRecompress()
      ]
    }))
    .pipe(gulp.dest(config.dir.dist + '/images'));
});

gulp.task('build', function(callback) {
  runSequence('build:template', 'build:style', 'build:script', 'build:image', callback);
});

gulp.task('server', function() {
  browserSync.init({
    files: config.dir.src,
    server: {
      baseDir: config.dir.dist
    }
  });
});

gulp.task('watch:template', ['build:template'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('watch:style', ['build:style'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('watch:script', ['build:script'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('watch:image', ['build:image'], function(done) {
  browserSync.reload();
  done();
});

gulp.task('default', ['server'], function() {
  gulp.watch(config.dir.src + '/templates/**/*.ejs', ['watch:template']);
  gulp.watch(config.dir.src + '/styles/**/*.scss', ['watch:style']);
  gulp.watch(config.dir.src + '/scripts/**/*.js', ['watch:script']);
  gulp.watch(config.dir.src + '/images/**/*.{png,jpg,gif,svg}', ['watch:image']);
});
