module.exports = function (grunt) {
   // Do grunt-related things in here

   grunt.initConfig({
      srcFolder: 'src/app',
      distFolder: 'dist',
      pkg: grunt.file.readJSON("package.json"),

      jshint: {
         // define the files to lint
         files: ['gruntfile.js', 'src/apps/*.js'],
         // configure JSHint (documented at http://www.jshint.com/docs/)
         options: {
            // more options here if you want to override JSHint defaults
            '-W045': true,
            '-W044': true,
            globals: {
               console: true,
               module: true,
               require: true,
               define: true
            }
         }
      },

      uglify: {
         options: {
            // the banner is inserted at the top of the output
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
            mangle: {
               except: ['jQuery', 'Q', 'JSON', 'enduring']
            }

         },
         main: {
            files: {
               'src/dist/enduring-stash.min.js': ['src/app/enduring.js']
            }
         },
         providers: {
            files: [
                 {
                    expand: true,     // Enable dynamic expansion.
                    cwd: 'src/app',      // Src matches are relative to this path.
                    src: ['*.provider.js'], // Actual pattern(s) to match.
                    dest: 'src/dist/',   // Destination path prefix.
                    ext: '.provider.min.js',   // Dest filepaths will have this extension.
                 },
            ],
         },
         
         dev: {
            options: { beautify: true, mangle: false },
            files: [
               {
                  'src/dist/enduring-stash.min.js': ['src/app/enduring.js']
               },
               {
                 expand: true,     // Enable dynamic expansion.
                 cwd: 'src/app',      // Src matches are relative to this path.
                 src: ['*.provider.js'], // Actual pattern(s) to match.
                 dest: 'src/dist/',   // Destination path prefix.
                 ext: '.provider.min.js',   // Dest filepaths will have this extension.
               },
            ],
         }
      },

      copy: {
         main: {
            files: [
              {
                 expand: true,
                 cwd: 'src/dist',
                 src: ['*.js', '!*.min.js'],
                 dest: 'enduring-stash/',
                 filter: 'isFile'
              }]
         }
      },
      
      watch: {
         js: {
            files: 'src/app/*.js',
            tasks: ['jshint', 'uglify:dev', 'copy'],
            options: {
               livereload: true,
            },
         },
      },
      


   });

   grunt.loadNpmTasks('grunt-contrib-jshint');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-watch');
   
   grunt.registerTask('default', ['jshint', 'uglify', 'copy']);
   grunt.registerTask('dev', ['watch']);

};