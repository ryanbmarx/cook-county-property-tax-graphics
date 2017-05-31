module.exports = function(grunt) {
  var config = {};

  // Put your JavaScript library dependencies here. e.g. jQuery, underscore,
  // etc.
  // You'll also have to install them using a command similar to:
  //     npm install --save jquery
  var VENDOR_LIBRARIES = [
    'd3',
    'leaflet',
    'leaflet-providers',
    '@turf/helpers',
    '@turf/inside',
    'pym.js',
    'lodash.debounce',
    'lodash.uniq',
    'topojson'
  ];


  config.browserify = {
    options: {
      browserifyOptions: {
        debug: true
      }
    },
    app: {
      src: ['js/src/app.js'],
      dest: 'js/app.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'app.min.js.map',
              output: './js/app.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              presets: ['es2015']
            }
          ]
        ]
      }
    }, 
    gauge: {
      src: ['js/src/gauge.js'],
      dest: 'js/gauge.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'gauge.min.js.map',
              output: './js/gauge.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              presets: ['es2015']
            }
          ]
        ]
      }
    },
    triennial: {
      src: ['js/src/triennial.js'],
      dest: 'js/triennial.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'triennial.min.js.map',
              output: './js/triennial.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              presets: ['es2015']
            }
          ]
        ]
      }
    },
 triennial: {
      src: ['js/src/map-render.js'],
      dest: 'js/map-render.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'map-render.min.js.map',
              output: './js/map-render.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              presets: ['es2015']
            }
          ]
        ]
      }
    },
    map: {
      src: ['js/src/map.js'],
      dest: 'js/map.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'map.min.js.map',
              output: './js/map.min.js.map'
            }
          ]
        ],
        transform: [
          [
            'babelify', {
              presets: ['es2015']
            }
          ]
        ]
      }
    }
  };

  // Check if there are vendor libraries and build a vendor bundle if needed
  if (VENDOR_LIBRARIES.length) {
    config.browserify.app.options = config.browserify.app.options || {};
    config.browserify.app.options.exclude = VENDOR_LIBRARIES;

    config.browserify.vendor = {
      src: [],
      dest: 'js/vendor.min.js',
      options: {
        plugin: [
          [
            'minifyify', {
              map: 'vendor.min.js.map',
              output: './js/vendor.min.js.map'
            }
          ]
        ],
        require: VENDOR_LIBRARIES
      }
    };
  }

  config.sass = {
    options: {
      outputStyle: 'compressed',
      sourceMap: true,
      includePaths: [ 'sass/', 'node_modules/trib-styles/sass/' ]
    },
    app: {
      files: {
        'css/styles.css': 'sass/styles.scss',
        'css/triennial-styles.css': 'sass/triennial-styles.scss',
        'css/map-styles.css': 'sass/map-styles.scss',
        'css/lookup-styles.css': 'sass/lookup-styles.scss'
      }
    }
  };

  config.watch = {
    sass: {
      files: ['sass/**/*.scss'],
      tasks: ['sass']
    },
    svg: {
      files: ['img/src/**/*.svg'],
      tasks: ['svgstore']
    },
    js: {
      files: ['js/src/**/*.js'],
      tasks: ['browserify']
    }
  };

  config.svgstore = {
    options: {
      cleanup:false,
      cleanupdefs:false
      // prefix : 'icon-', // This will prefix each ID 
      // svg: { // will add and overide the the default xmlns="http://www.w3.org/2000/svg" attribute to the resulting SVG 
      //   viewBox : '0 0 100 100',
      //   xmlns: 'http://www.w3.org/2000/svg'
      // }
    },
    min: {
      // Target-specific file lists and/or options go here. 
      src:['img/src/**/*.svg'],
      dest:'img/sprite.svg'
    },
  };

  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-svgstore');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  var defaultTasks = [];

  defaultTasks.push('sass');
  defaultTasks.push('svgstore');
  defaultTasks.push('browserify');

  grunt.registerTask('default', defaultTasks);
};