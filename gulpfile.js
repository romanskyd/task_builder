var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var inject = require('gulp-inject');



gulp.task('index', function () {
    var target = gulp.src('./app/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/jquery-ui-dist/jquery-ui.min.js',
        'node_modules/bootstrap3/dist/js/bootstrap.min.js',
        'node_modules/angular/angular.min.js',
        'node_modules/angular-route/angular-route.min.js',
        'node_modules/angular-animate/angular-animate.min.js',
        'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
        'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
        'node_modules/angular-drag-and-drop-lists/angular-drag-and-drop-lists.min.js',
        'node_modules/bootstrap3/dist/css/bootstrap.min.css',
        
    ], {read: false});
   
    return target.pipe(inject(sources))
      .pipe(gulp.dest('./app'));
  });
// Static server
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./app",
            //directory: true
            routes: {
                "/node_modules": "node_modules"
            }
        }
    });
    gulp.watch("./app/**/*.*").on('change', browserSync.reload);
});

gulp.task('default', [
    'index',
    'serve'
])