const { src, dest, watch, parallel, series } = require("gulp");

const sass = require("gulp-sass");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const del = require("del");

const rename = require("gulp-rename");
const svgstore = require("gulp-svgstore");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");

function browsersync() {
	browserSync.init({
		server: {
			baseDir: "source/",
		},
		port: 8080,
		browser: "firefox",
		notify: false,
	});
}

function scripts() {
	return (
		src([
			// 'node_modules/jquery/dist/jquery.js',
			"source/js/script.js",
		])
			// .pipe(concat("script.min.js"))
			// .pipe(concat('script.js'))
			.pipe(uglify())
			.pipe(dest("source/js"))
			.pipe(browserSync.stream())
	);
}

function styles() {
	return (
		src("source/sass/main.scss")
			// .pipe(sass({outputStyle: 'compressed'}))
			// .pipe(concat('main.min.css'))

			.pipe(sass({ outputStyle: "expanded" }))
			.pipe(concat("main.css"))

			.pipe(
				autoprefixer({
					overrideBrowserslist: ["last 10 version "],
					cascade: true,
					grid: true,
				})
			)
			.pipe(dest("source/css"))
			.pipe(browserSync.stream())
	);
}

function images() {
	return src("source/img/**/*")
		.pipe(
			imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ quality: 75, progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 }),
				imagemin.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest("build/img"));
}

function source() {
	return src(
		[
			"source/css/main.css",
			"source/fonts/**/*",
			"source/js/script.js",
			"source/*html",
		],
		{ base: "source" }
	).pipe(dest("build"));
}

function watching() {
	watch(["source/sass/**/*.scss"], styles);
	watch(["source/js/**/*.js", "!source/js/script.min.js"], scripts);
	watch(["source/*.html"]).on("change", browserSync.reload);
}

function cleanDist() {
	return del("build");
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scriptsc = scripts;

exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, source);

exports.default = parallel(scripts, browsersync, watching);

// запускать сначала default командой gulp - запустит слежку и все изменения
// команда gulp build сборка проекта очистит паку src далее именьшит картинки и далее все файлы зальет в папку src для продакшена
