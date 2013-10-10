module.exports = function (grunt) {
   // Do grunt-related things in here

   grunt.initConfig({
      srcFolder: 'src/app',
      distFolder: 'dist',
      pkg: grunt.file.readJSON("package.json"),



   });

   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.registerTask('default', []);
};