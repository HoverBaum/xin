var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('scripts', function() {
    return gulp.src(["src/xin.js", 'src/helper.js', 'src/modules.js', 'src/components.js'])
        .pipe(concat('xin.js'))
        .pipe(gulp.dest('dist/'));
});
