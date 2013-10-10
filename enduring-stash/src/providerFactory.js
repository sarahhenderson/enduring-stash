/*!
* provider.js v0.1
*
* Copyright (c) Sarah Henderson 2013. Some rights reserved.
* Licensed under GPL Version 2.
*
* Date: Fri 11 Oct 2013 
*/

define(function () {
   "use strict";

   var providers = [];
   var namedProviders = {};

   // Allows providers to register themselves if their storage method is supported
   // parameters: name and constructor function for the provider
   var registerProvider = function (name, Provider) {
   
      if (providerIsValid(name, Provider)) {
         // add necessary prototype methods to the provider
         Provider.prototype.stringify = stringify;
         Provider.prototype.unstringify = unstringify;
         Provider.prototype.isType = isType;
         Provider.prototype.quoteStr = quoteStr;
      
         providers.push(Provider);
         namedProviders[name] = Provider;
      }
   };

   var providerIsValid = function(name, Provider) {
      
      var methods = 'get getAll set add update contains remove removeAll'.split(' ');
      var providerInstance = new Provider();

      for (var i = 0; i < methods.length; i++) {
         var method = methods[i];

         if (!providerInstance[method]) {
            if (console && console.error) {
               console.error("Enduring Stash: Invalid provider! " + name + " provider is missing method " + method);
            }
            return false;
         }
      }
      return true;
   }
   

      // Returns whether there are any supported providers
      var hasProvider = function () {
         return providers.length > 0;
      }

      // Returns the first provider that registered that it works
      var getProvider = function () {
         if (hasProvider()) {
            var Provider = providers[0];
            return new Provider();
         } else {
            return undefined;
         }
      }

      // Returns a specific provider when multiple are available
      // Mostly for testing
      var forceProvider = function (name) {
         var Provider = namedProviders[name] || undefined;
         if (Provider) {
            return new Provider();
         } else {
            return null;
         }
      }


      // Returns whether a constructor is the constructor of a value
      var isType = function (Ctor, val) {
         return val !== undefined && val !== null && val.constructor === Ctor;
      }

      // Returns a safely quoted string
      var quoteStr = function (str) {
         return "'" +
         String(str)
         .replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(/\n/g, '\\n')
         .replace(/\r/g, '\\r')
         .replace(/\t/g, '\\t') +
         "'";
      }


      // Returns a string version of JavaScript
      var stringify = function (val) {

         if (isType(Date, val)) {
            return 'new Date(' + val.getTime() + ')';
         }

         if (isType(Array, val)) {
            var values = [];
            for (var i = 0; i < val.length; i++) {
               values.push(stringify(val[i]));
            }
            return '[' + values.join(',') + ']';
         }

         if (isType(Object, val)) {
            var values = [];
            for (var property in val) {
               values.push(quoteStr(property) + ':' + stringify(val[property]));
            }
            return '{' + values.join(',') + '}';
         }

         if (
            isType(RegExp, val)
          ) return String(val);

         return JSON.stringify(val);
      }

      // Returns a JavaScript version of a string
      var unstringify = function (str) {
         return new Function('return ' + str).apply();
      }

      return {
         hasProvider: hasProvider,
         getProvider: getProvider,
         forceProvider: forceProvider,
         registerProvider: registerProvider
      }


   });