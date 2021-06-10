// 引入 gulp
var gulp = require('gulp');
// gulp-autoprefixer gulp-sass
// 引入组件
var Autoprefixer = require('gulp-autoprefixer');//自动添加浏览器前缀
var htmlmin = require('gulp-htmlmin');//压缩html,可以压缩页面js、css
var imagemin = require('gulp-imagemin');//压缩图片文件（包括PNG、JPEG、GIF和SVG图片）
var minifycss = require('gulp-minify-css');//压缩css文件,并给引用url添加版本号避免缓存
var revappend = require('gulp-rev-append');//给页面的引用添加版本号，清除页面引用缓存
var spritesmith = require('gulp.spritesmith');//生成sprites图片和样式表
var less = require('gulp-less');//编译Less
var csslint = require('gulp-csslint');//检查css有无报错或警告
var jshint = require('gulp-jshint');//检查js有无报错或警告
var concat = require('gulp-concat');//合并js文件
var uglify = require('gulp-uglify');//压缩js文件
var babel = require('gulp-babel');//转换代码为ES6最新语法形式

//引入PostCss
var postcss = require('gulp-postcss');
var bem = require('postcss-bem');
var cssNext = require('postcss-cssnext');
var px2rem = require('postcss-px2rem');//px转换成rem
var autoprefixer = require('autoprefixer-core');
var postcssSimpleVars = require("postcss-simple-vars");
var postcssMixins = require("postcss-mixins");
var postcssNested = require("postcss-nested");
var sourcemaps = require("gulp-sourcemaps");


//nodeJS中管道式方法的api一般为.pipe()方法，管道化执行组件任务，它很类似jQuery中的链式写法

//定义一个Less任务（自定义任务名称）
// 编译Less
gulp.task('less', function() {
    gulp.src('./less/*.less') //该任务针对的文件，*代表所有文件
        .pipe(less()) //该任务调用的模块
        .pipe(gulp.dest('./css')); //将会在css目录下生成.css文件
});

//postcss处理css.
gulp.task("postcss", function(){
    var processors = [
        postcssMixins,
        postcssSimpleVars,
        postcssNested,
        cssNext,
        bem({style: 'bem'}),
        px2rem({
            remUnit: 75
        }),
        autoprefixer({
            browsers: ["Android 4.1", "iOS 7.1", "Chrome > 31", "ff > 31", "ie >= 10"]
        })];

    return gulp.src(['./css/*.css'])
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./stylesheets"));
});

//生成sprites图片和样式表
gulp.task('sprite', function () {
    var spriteData = gulp.src('./images/*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.css'
    }));
    return spriteData.pipe(gulp.dest('./sprite'));
});

//根据设置浏览器版本自动处理浏览器前缀
gulp.task('testAutoFx', function () {
    gulp.src('./css/*.css')
        .pipe(Autoprefixer({
            browsers: ['last 2 versions'], //主流浏览器的最新两个版本
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(gulp.dest('./dist/css'));
});

//将px转换成rem
gulp.task('px2rem', function() {
    var processors = [
        px2rem({
            remUnit: 75
        })
    ];
    return gulp.src('./css/*.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest('./dest'));
});

//转换代码为ES6最新语法形式
gulp.task('babel', function() {
    return gulp.src('./js/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/es6'));
});

//压缩HTML
gulp.task('testHtmlmin', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src('*.html')
        .pipe(htmlmin(options))
        .pipe(gulp.dest('./dist/html'));
});

//压缩图片
gulp.task('testImagemin', function () {
    gulp.src('./images/*.{png,jpg,gif,ico}')
        .pipe(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest('./dist/images'));
});

//压缩css
gulp.task('testCssmin', function () {
    gulp.src('./css/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest('./dist/css'));
});
// 检查css
gulp.task('csslint', function() {
    gulp.src('./css/*.css')
        .pipe(csslint())
        .pipe(csslint.reporter());
});

// 检查js
gulp.task('jslint', function() {
    gulp.src('./js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 合并、压缩js文件
gulp.task('scripts', function() {
    gulp.src('./js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});

//每个gulpfile.js里都应当有一个dafault任务，它是缺省任务入口
// 定义默认任务
gulp.task('default', function(){
    gulp.run('postcss', 'csslint', 'testImagemin', 'jslint', 'testCssmin', 'scripts');// 表示运行对应的任务

    // 监听文件变化，若有改动则执行以下三个任务
    gulp.watch('./js/*.js', function(){
        gulp.run('postcss', 'csslint', 'jslint', 'testCssmin', 'scripts');
    });
});