﻿/*!
* Stash.js
* (c) Sarah Henderson 2013
*/

window.enduring = (function () {
   "use strict";

   var Q = window.Q || undefined;
   var $ = window.jQuery || undefined;
   var JSON = window.JSON || undefined;

   // Stash requires a promise framework 
   if (!Q && !jQuery) throw 'Enduring Stash: Promise library unavailable! Include https://github.com/kriskowal/q/blob/master/q.js to fix.';

   // Stash requires json 
   if (!JSON) throw 'Enduring Stash: JSON unavailable! Include http://www.json.org/json2.js to fix.';



   // *** Stash "class" ------------------------------------- 
   // must be instantiated with a provider

   var Stash = function (name, provider) {

      this.provider = provider;
      if (!this.provider) { throw "Cannot create a stash without a provider"; }

      // establish keyPrefix for this collection
      this.keyPrefix = this.createKeyPrefix(name);
      if (!this.keyPrefix) { throw "Unable to create key prefix"; }

   };

   Stash.prototype.createKeyPrefix = function (name) {
      var prefix = "_stash_";
      prefix += name ? name + "_" : "";
      prefix = prefix.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      return prefix;
   }

   // creates a key unique to the collection and this application
   Stash.prototype.createStoreKey = function (key) {
      if (key instanceof Array || key === null || key === undefined) {
         throw "Invalid key: " + key;
      }
      return this.keyPrefix + key;
   };

   Stash.prototype.get = function (key) {
      var self = this;
      return self.promiseWrap(function (promise) {
         self.provider.get(self.createStoreKey(key), promise);
      });
   };

   Stash.prototype.set = function (key, value) {
      var self = this;
      return self.promiseWrap(function (promise) {
         self.provider.set(self.createStoreKey(key), value, promise);
      });
   };

   // wraps each provider method in a promise
   Stash.prototype.promiseWrap = function (callback) {
      var deferred = Q ? Q.defer() : $.Deferred();
      callback(deferred);
      return Q ? deferred.promise : deferred.promise();
   };

   // individual methods
   Stash.prototype.getAll = function () {
      var self = this;
      return self.promiseWrap(function (promise) {
         self.provider.getAll(self.keyPrefix, promise);
      });
   };
   Stash.prototype.update = function (key, value) {
      var self = this;
      return self.promiseWrap(function (promise) {
         self.provider.update(self.createStoreKey(key), value, promise);
      });
   };
   Stash.prototype.add = function (key, value) {
      var self = this;
      return self.promiseWrap(function (promise) {
         self.provider.add(self.createStoreKey(key), value, promise);
      });
   };
   Stash.prototype.remove = function (key) {
      var self = this;
      return self.promiseWrap(function (promise) {
         self.provider.remove(self.createStoreKey(key), promise);
      });
   };
   Stash.prototype.contains = function (key) {
      var self = this;
      return self.promiseWrap(function (promise) {
         self.provider.contains(self.createStoreKey(key), promise);
      });
   };
   Stash.prototype.removeAll = function () {
      var self = this;
      return self.promiseWrap(function (promise) {
         self.provider.removeAll(promise);
      });
   };


   var providerFactory = (function () {

      var availableProviders = [];
      var namedProviders = {};

      // Allows providers to register themselves if their storage method is supported
      // parameters: name and constructor function for the provider
      var registerProvider = function (name, ProviderConstructor) {

         if (providerIsValid(name, ProviderConstructor)) {
            // add necessary prototype methods to the provider
            ProviderConstructor.prototype.stringify = stringify;
            ProviderConstructor.prototype.unstringify = unstringify;
            ProviderConstructor.prototype.isType = isType;
            ProviderConstructor.prototype.quoteStr = quoteStr;

            availableProviders.push(ProviderConstructor);
            namedProviders[name] = ProviderConstructor;
         }
      };

      var providerIsValid = function (name, Provider) {

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
      };


      // Returns whether there are any supported providers
      var hasProvider = function () {
         return availableProviders.length > 0;
      };

      // Returns the first provider that registered 
      var getProvider = function () {
         if (hasProvider()) {
            var Provider = availableProviders[0];
            return new Provider();
         } else {
            return undefined;
         }
      };

      // Returns a specific provider when multiple are available
      // Mostly for testing
      var forceProvider = function (providerName) {
         var Provider = namedProviders[providerName] || undefined;
         if (Provider) {
            return new Provider();
         } else {
            return null;
         }
      };

      // The methods below are attached to any registered providers.
      // Returns whether a constructor is the constructor of a value
      var isType = function (Ctor, value) {
         return value !== undefined && value !== null && value.constructor === Ctor;
      };

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
      };


      // Returns a string version of JavaScript
      var stringify = function (value) {

         if (isType(Date, value)) {
            return 'new Date(' + value.getTime() + ')';
         }

         if (isType(Array, value)) {
            var arrayValues = [];
            for (var i = 0; i < value.length; i++) {
               arrayValues.push(stringify(value[i]));
            }
            return '[' + arrayValues.join(',') + ']';
         }

         if (isType(Object, value)) {
            var objectValues = [];
            for (var property in value) {
               objectValues.push(quoteStr(property) + ':' + stringify(value[property]));
            }
            return '{' + objectValues.join(',') + '}';
         }

         if (
            isType(RegExp, value)
          ) return String(value);

         return JSON.stringify(value);
      };

      // Returns a JavaScript version of a string
      // This isn't nice, but is the only way to get back date objects rather than
      // JSON date strings
      var unstringify = function (str) {
         return new Function('return ' + str).apply();
      };

      return {
         hasProvider: hasProvider,
         getProvider: getProvider,
         forceProvider: forceProvider,
         registerProvider: registerProvider
      };

   })();



   // *** Functions to actually create the stash object with a provider ----------------- 

   var createStash = function (collection, providerName) {

      if (!providerFactory.hasProvider()) {
         throw 'Enduring Stash: No storage providers available! Include at least one provider.';
      }

      var thisProvider = null;
      if (providerName) {
         thisProvider = providerFactory.forceProvider(providerName);

         if (!thisProvider) {
            throw "Cannot force use of " + providerName + " provider - it is not available";
         }
      } else {
         thisProvider = providerFactory.getProvider();
      }
      //      console.log('instantiated a stash with provider');
      //      console.log(thisProvider);
      var stash = new Stash(collection, thisProvider);
      //      console.log('stash instance is');
      //      console.log(stash);
      return stash;
   };


   var stashOf = function (collection, providerName) {
      return createStash(collection, providerName);
   };


   var stash = function () {
      return createStash('');
   };


   return { // public API
      stash: stash,
      stashOf: stashOf,
      provider: providerFactory
   };
})();