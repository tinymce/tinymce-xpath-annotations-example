const {
  CheckerPlugin,
  TsConfigPathsPlugin
} = require('awesome-typescript-loader');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const path = require('path');
const fs = require('fs');
const swag = require('@ephox/swag');

module.exports = function (grunt) {
  var packageData = grunt.file.readJSON('package.json');
  var BUILD_VERSION = packageData.version + '-' + (process.env.BUILD_NUMBER ? process.env.BUILD_NUMBER : '0');
  const libPluginPath = 'lib/main/ts/Plugin.js';
  const scratchPluginPath = 'scratch/compiled/plugin.js';
  const scratchPluginMinPath = 'scratch/compiled/plugin.min.js';
  const tsPluginSourceFile = path.resolve('src/main/ts/Plugin.ts');
  const jsPluginDestFile = path.resolve('scratch/compiled/plugin.js');

  grunt.initConfig({
    pkg: packageData,

    shell: {
      command: 'tsc'
    },

    rollup: {
      options: {
        treeshake: true,
        moduleName: 'yannotations',
        format: 'iife',
        banner: '(function () {',
        footer: 'yannotations();})()',
        plugins: [
          swag.nodeResolve({
            basedir: __dirname,
            prefixes: {}
          }),
          swag.remapImports()
        ]
      },
      plugin: {
        files: [
          {
            src: libPluginPath,
            dest: scratchPluginPath
          }
        ]
      }
    },

    concat: {
      license: {
        options: {
          process: function (src) {
            var buildSuffix = process.env.BUILD_NUMBER ? '-' + process.env.BUILD_NUMBER : '';
            return src.replace(/@BUILD_NUMBER@/g, packageData.version + buildSuffix);
          }
        },
        files: {
          // .min.js in both places is not a typo it ensures that the output is always minified
          'dist/tinymce-xpath-annotations-example/js/plugin.js': ['src/main/text/license-header.js', scratchPluginMinPath],
          'dist/tinymce-xpath-annotations-example/js/plugin.min.js': ['src/main/text/license-header.js', scratchPluginMinPath]
        }
      }
    },

    uglify: {
      'bolt-plugin': {
        options: {
          beautify: {
            ascii_only: true
          }
        },
        files: [
          {
            src: scratchPluginPath,
            dest: scratchPluginMinPath
          }
        ]
      }
    },

    test: {

    },

    copy: {
      css: {
        files: [
          { cwd: 'src/text', src: ['license.txt'], dest: 'dist/tinymce-xpath-annotations-example', expand: true },
          { src: ['changelog.txt'], dest: 'dist/tinymce-xpath-annotations-example', expand: true }
        ]
      },

      example: {
        files: [
          { cwd: 'src/text', src: ['license.txt'], dest: 'dist/tinymce-xpath-annotations-example', expand: true },
          { src: ['changelog.txt'], dest: 'dist/tinymce-xpath-annotations-example', expand: true },
          { src: ['src/main/css/example.css'], dest: 'dist/tinymce-xpath-annotations-example/css/example.css', expand: false},
          { src: ['src/main/html/example.html'], dest: 'dist/tinymce-xpath-annotations-example/example.html', expand: false},
          { src: [ 'dist/tinymce-xpath-annotations-example/plugin.js' ], dest: 'dist/tinymce-xpath-annotations-example/js/plugin.js', expand: false },
          { src: 'LICENSE.txt', dest: 'dist/tinymce-xpath-annotations-example/LICENSE.txt' }
        ]
      }
    },


    webpack: {
      options: {
        watch: true
      },
      plugin: {
        watch: false,
        entry: tsPluginSourceFile,
        devtool: 'source-map',

        resolve: {
          extensions: ['.ts', '.js'],
          plugins: [
            new TsConfigPathsPlugin({
              compiler: 'typescript'
            })
          ]
        },

        module: {
          rules: [
            {
              test: /\.js$/,
              use: ['source-map-loader'],
              enforce: 'pre'
            },

            {
              test: /\.ts$/,
              use: [
                {
                  loader: 'awesome-typescript-loader',
                  options: {
                    transpileOnly: true
                  }
                }
              ]
            }
          ]
        },

        plugins: [new LiveReloadPlugin(), new CheckerPlugin()],

        output: {
          filename: path.basename(jsPluginDestFile),
          path: path.dirname(jsPluginDestFile)
        }
      }
    },

    tslint: {
      options: {
        configuration: 'tslint.json'
      },
      plugin: ['src/**/*.ts']
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('version', 'Creates a version file', function () {
    grunt.file.write('dist/tinymce-xpath-annotations-example/version.txt', BUILD_VERSION);
  });

  grunt.registerTask('default', [
    'tslint',
    'shell',
    'webpack:plugin',
    'uglify',
    'concat',
    'copy',
    'version'
  ]);
};
