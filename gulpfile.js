
//gulp dependencies
const {src, dest, series, parallel, watch} = require('gulp');

//other dependencies
const concat   = require('gulp-concat');
const connect  = require('gulp-connect');
const del      = require('del');
const imageMin = require('gulp-imagemin');
const log      = require('fancy-log');
const maps     = require('gulp-sourcemaps');
const minfify  = require('gulp-uglify');
const rename   = require('gulp-rename');
const sass     = require('gulp-sass');

//paths and ordering for all js
const scriptPaths =
[
    'src/js/circle/autogrow.js',
    'src/js/circle/circle.js',
    'src/js/global.js'
];

//color code for console logging
const consoleColors =
{
    'green' : '\x1b[32m%s\x1b[0m'
};

//deletes 'dist' folder
function clean()
{
    return del('dist');
}

//moves all html to 'dist' folder
function buildHtml()
{
    return src('src/*.html')
        .pipe(dest('dist'));
}

//compiles, concats, and minifies all sass into 'dist/script' folder
function buildCss()
{
    return src("src/sass/global.scss")
        .pipe(maps.init())
        .pipe(sass())
        .pipe(rename('all.min.css'))
        .pipe(maps.write('./'))
        .pipe(dest('dist/styles'));
}

//concats and minifies all js into 'dist/scripts' folder
function buildJs()
{
    return src(scriptPaths)
        .pipe(maps.init())
        .pipe(concat('all.min.js'))
        .pipe(dest('dist/scripts'))
        .pipe(minfify())
        .pipe(maps.write('./'))
        .pipe(dest('dist/scripts'));
}

//minifies all images into 'dist/images' folder
function buildImg()
{
    return src('src/images/*')
        .pipe(imageMin())
        .pipe(dest('dist/images'));
}

//moves all icons into 'dist/icons' folder
function buildIcon()
{
    return src('src/icons/**/*')
        .pipe(dest('dist/icons'));
}

//serves project on local host
function serve(cb)
{
    connect.server(
    {
        name: 'Build Test',
        root: 'dist',
        port: 3000,
        //livereload: true
    });

    cb();
}

//sets watch task to watch sass, js, and html files
function watchFiles(cb)
{
    log(consoleColors.green, 'Watching files for changes...',);
    watch('src/sass/**/*.scss', buildCss);
    watch('src/sass/**/*.sass', buildCss);
    watch('src/js/**/*.js', buildJs);
    watch('src/**/*.html', buildHtml);

    cb();
}

//tasks
const buildTask   = series(clean, parallel(buildHtml, buildCss, buildJs, buildImg, buildIcon));
const runTask     = parallel(serve, watchFiles);
const defaultTask = series(buildTask, runTask);
  
//available gulp commands in console
exports.clean    = clean;
exports.html     = buildHtml;
exports.styles   = buildCss;
exports.scripts  = buildJs;
exports.images   = buildImg;
exports.icons    = buildIcon;
exports.serve    = serve;
exports.watch    = watchFiles;
exports.build    = buildTask;
exports.run      = runTask;
exports.default  = defaultTask;