(function () {
   "use strict";

   var enduring = window.enduring || undefined;
   if (!enduring) {
      throw "Enduring Stash: Enduring Stash is missing!";
   }

   var WebSQLStorage = function () {
      this.storage = {};
   };

   WebSQLStorage.prototype.get = function (key, promise) {
      promise.resolve(this.storage[key]);
   };

   WebSQLStorage.prototype.getAll = function (key, promise) {

      var items = [];
      for (var itemKey in this.storage) {
         if (this.storage.hasOwnProperty(itemKey) &&
             itemKey.substring(0, key.length) === key) {
            items.push(this.storage[itemKey]);
         }
      }
      promise.resolve(items);

   };

   WebSQLStorage.prototype.set = function (key, value, promise) {

      this.storage[key] = value;
      promise.resolve(value);
   };

   WebSQLStorage.prototype.add = function (key, value, promise) {

      if (!this.storage.hasOwnProperty(key)) {
         this.storage[key] = value;
         promise.resolve(value);
      } else {
         promise.reject("Item already exists");
      }

   };

   WebSQLStorage.prototype.update = function (key, value, promise) {

      if (this.storage.hasOwnProperty(key)) {
         this.storage[key] = value;
         promise.resolve(value);
      } else {
         promise.reject("Item does not exist");
      }

   };


   WebSQLStorage.prototype.remove = function (key, promise) {

      if (this.storage.hasOwnProperty(key)) {
         delete this.storage[key];
      }
      promise.resolve();


   };
   WebSQLStorage.prototype.contains = function (key, promise) {

      promise.resolve(this.storage.hasOwnProperty(key));

   };
   WebSQLStorage.prototype.removeAll = function (promise) {

      this.storage = {};
      promise.resolve();

   };

   enduring.provider.registerProvider("WebSQL", WebSQLStorage);

   return WebSQLStorage;


})();