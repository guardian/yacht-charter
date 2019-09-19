import config from './config.json'

import gulp from 'gulp'
import file from 'gulp-file'
import gutil from 'gulp-util'
import s3 from 'gulp-s3-upload';
import sass from 'gulp-sass'
import size from 'gulp-size'
import sourcemaps from 'gulp-sourcemaps'
import template from 'gulp-template'

import browserSync from 'browser-sync'
import del from 'del'
import fs from 'fs'
import inquirer from 'inquirer'
import rp from 'request-promise-native'
import runSequence from 'run-sequence'
import source from 'vinyl-source-stream'
import named from 'vinyl-named'
import buffer from 'vinyl-buffer'
import replace from 'gulp-replace'

import webpack from 'webpack'
import ws from 'webpack-stream'
const debug = require('gulp-debug');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm

const browser = browserSync.create();

const buildDir = '.build';
const cdnUrl = 'https://interactive.guim.co.uk';

const isDeploy = gutil.env._.indexOf('deploy') > -1 || gutil.env._.indexOf('deploylive') > -1 || gutil.env._.indexOf('deploypreview') > -1;

const version = `html`;
const s3Path = `embed/iframeable/${config.path}`;
const s3VersionPath = `${s3Path}/${version}`;
const path = isDeploy ? `${cdnUrl}/${s3VersionPath}` : '.';

// hack to use .babelrc environments without env var, would be nice to
// be able to pass "client" env through to babel
const babelrc = JSON.parse(fs.readFileSync('.babelrc'));
const presets = (babelrc.presets || []).concat(babelrc.env.client.presets);
const plugins = (babelrc.plugins || []).concat(babelrc.env.client.plugins);

function logError(plugin, err) {
    console.error(new gutil.PluginError(plugin, err.message).toString());
    if (err instanceof SyntaxError) {
        console.error(err.codeFrame);
    }
}

let webpackPlugins = [
    new webpack.LoaderOptionsPlugin({
        options: {
            babel: {
                presets,
                plugins
            }
        }
    })
];

webpackPlugins.push(new HtmlWebpackPlugin());

if (isDeploy) webpackPlugins.push(new UglifyJSPlugin({ sourceMap : true }));

function buildJS(filename) {
    return () => {
        return gulp.src(`./src/js/${filename}`)
            .pipe(named())
            .pipe(ws({
                watch: false,
                mode: isDeploy ? 'production' : 'development',
                module: {
                    rules: [
                        {
                            test: /\.css$/,
                            loader: 'style!css'
                        },
                        {
                            test: /\.js$/,
                            exclude: /node_modules/,
                            use: 'babel-loader'
                        },
                        {
                            test: /\.html$/,
                            use: 'raw-loader'
                        },
                        {
                            test: /\.txt$/,
                            use: 'html-loader'
                        }
                    ]
                },
                devtool: 'source-map',
                plugins: webpackPlugins
            }, webpack))
            .on('error', function handleError(e) {
                this.emit('end'); // Recover from errors
            })
            .pipe(replace('<%= path %>', path))
            .pipe(gulp.dest(buildDir));

    }
}

function s3Upload(cacheControl, keyPrefix) {
    return s3()({
        'Bucket': 'gdn-cdn',
        'ACL': 'public-read',
        'CacheControl': cacheControl,
        'keyTransform': fn => `${keyPrefix}/${fn}`
    });
}

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

function readOpt(fn) {
    try {
        return fs.readFileSync(fn);
    } catch (err) {
        return '';
    }
}

gulp.task('clean', () => del(buildDir));

gulp.task('build:css', () => {
    return gulp.src('src/css/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            'outputStyle': isDeploy ? 'compressed' : 'expanded'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        // .pipe(template({
        //     path
        // }))
        .pipe(replace('<%= path %>', path))
        .pipe(gulp.dest(buildDir))
        .pipe(browser.stream({
            'match': '**/*.css'
        }));
});

gulp.task('build:js.main', buildJS('main.js'));
gulp.task('build:js.app', buildJS('app.js'));
gulp.task('build:js', ['build:js.main', 'build:js.app']);

gulp.task('build:html', cb => {
    try {
        let render = requireUncached('./src/render.js').render;

        Promise.resolve(render()).then(html => {
            file('main.html', html, {
                    'src': true
                })
                .pipe(replace('<%= path %>', path))
                .pipe(gulp.dest(buildDir))
                .on('end', cb);
        }).catch(err => {
            logError('render.js', err);
            cb();
        });
    } catch (err) {
        logError('render.js', err);
        cb();
    }
});

gulp.task('build:assets', () => {
    return gulp.src('src/assets/**/*').pipe(gulp.dest(`${buildDir}/assets`));
});

gulp.task('_build', ['clean'], cb => {
    runSequence(['build:css', 'build:js', 'build:html', 'build:assets'], cb);
});

// TODO: less hacky build/_build?
gulp.task('build', ['_build'], () => {
    return gulp.src('iframe/*')
        .pipe(template({
            'css': readOpt(`${buildDir}/main.css`),
            'html': readOpt(`${buildDir}/main.html`),
            'js': readOpt(`${buildDir}/main.js`)
        }))
        .pipe(gulp.dest(buildDir));
});

gulp.task('deploy', ['build'], cb => {
    if (s3Path === "embed/iframeable/2018/10/iTest") {
        console.error("ERROR: You need to change the deploy path from its default value")
        return;
    }

    inquirer.prompt({
        type: 'list',
        name: 'env',
        message: 'Where would you like to deploy to?',
        choices: ['preview', 'live']
    }).then(res => {
        let isLive = res.env === 'live';
        gulp.src(`${buildDir}/**/*`)
            .pipe(s3Upload('max-age=300000', s3VersionPath))
            .on('end', () => {
                gulp.src('config.json')
                    .pipe(file('preview', version))
                    .pipe(isLive ? file('live', version) : gutil.noop())
                    .pipe(s3Upload('max-age=30', s3Path))
                    .on('end', cb);
            });
    });
});

gulp.task('local', ['build'], () => {
    return gulp.src('harness/*')
        .pipe(template({
            'css': readOpt(`${buildDir}/main.css`),
            'html': readOpt(`${buildDir}/main.html`),
            'js': readOpt(`${buildDir}/main.js`)
        }))
        .pipe(replace('<%= path %>', path))
        .pipe(gulp.dest(buildDir));
});

gulp.task('local:html', ['build:html'], () => {
    return gulp.src('harness/*')
        .pipe(template({
            'css': readOpt(`${buildDir}/main.css`),
            'html': readOpt(`${buildDir}/main.html`),
            'js': readOpt(`${buildDir}/main.js`)
        }))
        .pipe(replace('<%= path %>', path))
        .pipe(gulp.dest(buildDir));
});

gulp.task('default', ['local'], () => {
    gulp.watch(['src/**/*', '!src/css/*', '!src/js/app.js', '!src/render.js', '!src/assets/*'], ['local']).on('change', evt => {
        gutil.log(gutil.colors.yellow(`${evt.path} was ${evt.type}`));
    });

    gulp.watch(['src/css/*'], ['build:css']).on('change', evt => {
        gutil.log(gutil.colors.yellow(`${evt.path} was ${evt.type}`));
    });

    gulp.watch(['src/js/app.js'], ['build:js']).on('change', evt => {
        gutil.log(gutil.colors.yellow(`${evt.path} was ${evt.type}`));
    });

    gulp.watch(['src/render.js'], ['local:html']).on('change', evt => {
        gutil.log(gutil.colors.yellow(`${evt.path} was ${evt.type}`));
    });

    gulp.watch(['src/assets/*'], ['build:assets']).on('change', evt => {
        gutil.log(gutil.colors.yellow(`${evt.path} was ${evt.type}`));
    });

    browser.init({
        'server': {
            'baseDir': buildDir
        },
        'port': 8000
    });
});

gulp.task('deploylive', ['build'], cb => {
    if (s3Path === "embed/iframeable/2018/10/iTest") {
        console.error("ERROR: You need to change the deploy path from its default value")
        return;
    }

    gulp.src(`${buildDir}/**/*`)
        .pipe(s3Upload('max-age=31536000', s3VersionPath))
        .on('end', () => {
            gulp.src('config.json')
                .pipe(file('preview', version))
                .pipe(file('live', version))
                .pipe(s3Upload('max-age=30', s3Path))
                .on('end', cb);
        });
});

gulp.task('deploypreview', ['build'], cb => {
    if (s3Path === "embed/iframeable/2018/10/iTest") {
        console.error("ERROR: You need to change the deploy path from its default value")
        return;
    }

    gulp.src(`${buildDir}/**/*`)
        .pipe(s3Upload('max-age=31536000', s3VersionPath))
        .on('end', () => {
            gulp.src('config.json')
                .pipe(file('preview', version))
                .pipe(s3Upload('max-age=30', s3Path))
                .on('end', cb);
        });
});

gulp.task('url', () => {
    let url = `${cdnUrl}/embed/iframeable/${config.path}/${version}/index.html`;
    gutil.log(gutil.colors.green(`iframeable URL: ${url}`));
});

gulp.task('log', () => {
    function log(type) {
        let url = `${cdnUrl}/embed/iframeable/${config.path}/${type}.log?${Date.now()}`;
        return rp(url).then(log => {
            gutil.log(gutil.colors.green(`Got ${type} log:`));
            console.log(log);
        }).catch(err => {
            if (err.statusCode === 404) {
                gutil.log(gutil.colors.yellow(`No ${type} log, have you ever deployed?`));
            } else {
                throw err;
            }
        });
    }

    return Promise.all([log('live'), log('preview')]);
});