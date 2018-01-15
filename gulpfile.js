const _                     = require('underscore');
const gulp                  = require('gulp');
const babel                 = require('gulp-babel');
const header                = require('gulp-header');
const eslint                = require('gulp-eslint');
const cached                = require('gulp-cached');
const size                  = require('gulp-size');
const exec                 = require('child_process').exec;

let babelOption = {
    presets: [
        'es2015',
        'stage-2'
    ],
    plugins: ['rewire'],
    env: {
        cover: {
            plugins: ['istanbul']
        }
    }
};

let headerContent = '"use strict";require("babel-polyfill");\n//mixin head end\n\n';

let buildScript = (name, src) =>
    gulp.src(src)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(cached(`server`))
        .pipe(babel(babelOption))
        .pipe(header(headerContent))
        .pipe(size({
            title: `server`
        }))
        .pipe(gulp.dest(`product/server/`));

let buildAppScript = (name, src) =>
    gulp.src(src)
        .pipe(gulp.dest(`product/app/`));

let buildHtmlScript = (name, src) =>
    gulp.src(src)
        .pipe(gulp.dest(`product/app/`));

let buildTestScript = (name, src) =>
    gulp.src(src)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(cached(`test`))
        .pipe(babel(babelOption))
        .pipe(header(headerContent))
        .pipe(size({
            title: `test`
        }))
        .pipe(gulp.dest(`lib/test/`));

let gulpTasks = {

    buildSrc: () => {

        buildScript('src', ['server/*.js', 'server/**/*.js', 'server/**/**/*.js']);
    
    },

    buildApp: () => {
        
        buildAppScript('app', ['app/**']);
        
    },

    buildHtml: () => {
        
        buildHtmlScript('front', ['./*.html']);
        
    },

    buildTest: () => {

        buildTestScript('test', ['test/*.js']);

    },

    webpackTask: () => {

        exec('webpack --progress --hide-modules', (err, stdout) => {

            if (err) {

                throw err;

            }

            console.log(stdout);

        });

    },

    build: ['buildSrc', 'buildHtml'],

    watch: () => {

        gulp.watch(['server/*.js', 'server/**/*.js', 'server/**/**/*.js'], ['buildSrc']);
        gulp.watch('src/*', ['webpackTask']);

    }

};

_.each(gulpTasks, (v, k) => gulp.task(k, v));
