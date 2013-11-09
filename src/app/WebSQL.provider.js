(function () {
   "use strict";

   var enduring = window.enduring || undefined;
   if (!enduring) {
      throw "Enduring Stash: Enduring Stash is missing!";
   }

   var WebSQLStorage = function () {

      var dbSize = 5 * 1024 * 1024; // 5MB
      this.storage = openDatabase("EnduringStash", "1", "Enduring Stash Data Storage", dbSize);

      this.storage.transaction(function (tx) {
         var createTableStatement = "CREATE TABLE IF NOT EXISTS Stash (id STRING PRIMARY KEY, value TEXT)";
         var statementParams = [];
         var successCallback = null;
         var errorCallback = this.onError;

         tx.executeSql(createTableStatement, statementParams, successCallback, errorCallback);
      },
		this.onError
	   );
   };

   WebSQLStorage.prototype.onError = function (error) {
      console.error(error);
   };

   WebSQLStorage.prototype.get = function (key, promise) {
      var self = this;
      this.storage.transaction(function (tx) {
         var sqlStatement = "SELECT value FROM Stash WHERE id = ?";
         var statementParams = [key];
         var successCallback = function (tx, result) {
            if (result.rows.length > 1) {
               promise.reject("More than one item has the same key");
               return;
            } else if (result.rows.length === 0) {
               promise.resolve(undefined);
               return;
            }
            var rawValue = result.rows.item(0).value;
            var value = self.unstringify(rawValue);
            promise.resolve(value);
         };
         var errorCallback = function (tx, error) { promise.reject(error); };

         tx.executeSql(sqlStatement, statementParams, successCallback, errorCallback);
      },
		this.onError
	   );
   };

   WebSQLStorage.prototype.getAll = function (keyPrefix, promise) {
      var self = this;
      this.storage.transaction(function (tx) {
         var sqlStatement = "SELECT value FROM Stash WHERE id LIKE ?";
         var statementParams = [keyPrefix + '%'];
         var successCallback = function (tx, result) {
            var data = [];
            for (var i = 0; i < result.rows.length; i++) {
               var item = result.rows.item(i).value;
               var us = self.unstringify(item);
               data.push(self.unstringify(item));
            }
            promise.resolve(data);
         };
         var errorCallback = function (tx, error) { promise.reject(error); };

         tx.executeSql(sqlStatement, statementParams, successCallback, errorCallback);
      },
		this.onError
	   );
   };

   WebSQLStorage.prototype.set = function (key, value, promise) {
      var self = this;
      this.storage.transaction(function (tx) {
         var sqlStatement = "SELECT COUNT(*) as count FROM Stash WHERE id = ?";
         var statementParams = [key];
         var successCallback = function (tx, result) {
            var itemCount = result.rows.item(0).count;
            if (itemCount > 0) {
               return self.update(key, value, promise);
            } else {
               return self.add(key, value, promise);
            }

         };
         var errorCallback = function (tx, error) { promise.reject(error); };

         tx.executeSql(sqlStatement, statementParams, successCallback, errorCallback);
      },
		this.onError
	   );
   };

   WebSQLStorage.prototype.add = function (key, value, promise) {
      var self = this;
      this.storage.transaction(function (tx) {
         var sqlStatement = "INSERT INTO Stash (id, value) VALUES (?, ?)";
         var statementParams = [key, self.stringify(value)];
         var successCallback = function (tx, result) {
            if (result.rowsAffected !== 1) {
               promise.reject("Value was not updated");
               return;
            }
            promise.resolve(value);
         };
         var errorCallback = function (tx, error) { promise.reject(error); };

         tx.executeSql(sqlStatement, statementParams, successCallback, errorCallback);
      },
		this.onError
	   );
   };

   WebSQLStorage.prototype.update = function (key, value, promise) {
      var self = this;
      this.storage.transaction(function (tx) {
         var sqlStatement = "UPDATE Stash SET value = ? WHERE id = ?";
         var statementParams = [self.stringify(value), key];
         var successCallback = function (tx, result) {
            if (result.rowsAffected === 1) {
               promise.resolve(value);
            } else {
               promise.reject("Item was not updated");
            }
         };
         var errorCallback = function (tx, error) { promise.reject(error); };

         tx.executeSql(sqlStatement, statementParams, successCallback, errorCallback);
      },
		this.onError
	   );
   };


   WebSQLStorage.prototype.remove = function (key, promise) {
      this.storage.transaction(function (tx) {
         var sqlStatement = "DELETE FROM Stash WHERE id = ?";
         var statementParams = [key];
         var successCallback = function (tx, result) {
            promise.resolve();
         };
         var errorCallback = function (tx, error) { promise.reject(error); };

         tx.executeSql(sqlStatement, statementParams, successCallback, errorCallback);
      },
		this.onError
	   );
   };

   WebSQLStorage.prototype.contains = function (key, promise) {
      this.storage.transaction(function (tx) {
         var sqlStatement = "SELECT * FROM Stash WHERE id = ?";
         var statementParams = [key];
         var successCallback = function (tx, result) {
            var itemCount = result.rows.length;
            promise.resolve(itemCount > 0);
         };
         var errorCallback = function (tx, error) { promise.reject(error); };

         tx.executeSql(sqlStatement, statementParams, successCallback, errorCallback);
      },
		this.onError
	   );
   };

   WebSQLStorage.prototype.removeAll = function (promise) {
      this.storage.transaction(function (tx) {
         var sqlStatement = "DELETE FROM Stash";
         var statementParams = [];
         var successCallback = function (tx, result) { promise.resolve(); };
         var errorCallback = function (tx, error) { promise.reject(error); };

         tx.executeSql(sqlStatement, statementParams, successCallback, errorCallback);
      },
		this.onError
	   );
   };

   if (window.openDatabase) {
      enduring.provider.registerProvider("WebSQL", WebSQLStorage);
      return WebSQLStorage;
   }


})();