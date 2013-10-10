define(['providerFactory'], function (providerFactory) {
   "use strict";

   var Cookie = function () {

   };

   Cookie.prototype.get = function (key, promise) {

      var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
      if (match) {
         promise.resolve(this.unstringify(decodeURIComponent(match[2])));
      } else {
         promise.resolve(undefined);
      }

   };
   Cookie.prototype.getAll = function (key, promise) {

      var pairs = document.cookie.split(';');
      var len = pairs.length;
      var cookies = [];
      for (var i = 0; i < len; i++) {
         var pair = pairs[i].split('=');
         
         var itemKey = pair[0].trim();
         if (itemKey !== "" && itemKey.substring(0, key.length) === key) {
            cookies.push(
               this.unstringify(decodeURIComponent(pair[1]))
            );
         }
      }
      promise.resolve(cookies);

   };

   Cookie.prototype.set = function (key, value, promise) {

      var cookieStr = key + "=" + encodeURIComponent(this.stringify(value));
      document.cookie = cookieStr;
      promise.resolve(value);

   };

   Cookie.prototype.add = function (key, value, promise) {

      var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
      if (!match) {
         return this.set(key, value, promise);
      } else {
         promise.reject("Item already exists");
      }
   };
   Cookie.prototype.update = function (key, value, promise) {
      var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
      if (match) {
         return this.set(key, value, promise);
      } else {
         promise.reject("Item does not exist");
      }
   };

   Cookie.prototype.remove = function (key, promise) {

      var expiry = new Date();
      expiry.setTime(expiry.getTime() - 1);
      document.cookie = key += "=; expires=" + expiry.toUTCString();
      promise.resolve();

   };
   Cookie.prototype.contains = function (key, promise) {

      var match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
      match ? promise.resolve(true) : promise.resolve(false);

   };
   Cookie.prototype.removeAll = function (promise) {

      try{
         var pairs = document.cookie.split(';');
         var len = pairs.length;
         var cookies = [];
         for (var i = 0; i < len; i++) {
            var pair = pairs[i].split('=');
            var expiry = new Date();
            expiry.setTime(expiry.getTime() - 1);
            document.cookie = pair[0] += "=; expires=" + expiry.toUTCString();
         }
         promise.resolve();
      } catch (e) {
         promise.reject(e);
      }
   };

   providerFactory.registerProvider("Cookie", Cookie);

   return Cookie;


});