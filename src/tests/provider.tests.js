define(['QUnit', 'enduring'], function (QUnit, enduring) {
       "use strict";

       var run = function (providerDisplayName, providerName) {

          module(providerDisplayName);
          var stash = enduring.stashOf(name, providerName);

          test("enduring stash can be created using " + providerDisplayName, function () {
             QUnit.ok(stash);
          });

          runDataTypeTests(stash);
          runAccessTests(stash);
          runCollectionTests(stash, providerName);
       };

       var runCollectionTests = function (stash, providerName) {
          
          var peopleStash = enduring.stashOf('people', providerName);
          var carStash = enduring.stashOf('cars', providerName);

          test("enduring stash with named collection can be created", function (assert) {
             ok(peopleStash);
          });

          asyncTest("enduring stash get doesn't retrieve items added to a different stash", function (assert) {

             var expected = { key: 'val', value: 3.14 };
             var setup = carStash.set('val', expected.value);
             setup.then(function () {

                var test = peopleStash.get(expected.key);
                test.then(function (actualValue) {
                   assert.equal(undefined, actualValue, 'value should be undefined');
                })
                .finally(start);

             }).fail(start);
          });

          asyncTest("enduring stash contains returns false for items added to a different stash", function (assert) {

             var expected = { key: 'val', value: 3.14 };

             var setup = carStash.set('val', expected.value);
             setup.then(function () {

                var test = peopleStash.contains(expected.key);

                test.then(function (actualValue) {
                   assert.equal(false, actualValue, 'is not available in the named stash');
                })
                .finally(start);

             }).fail(start);

          });

          asyncTest("enduring stash getAll doesn't retrieve items added to a different stash", 4, function (assert) {

             var now = new Date().getTime();
             var expected1 = { key: 'val' + now + Math.random(), value: 11 };
             var expected2 = { key: 'val' + now + Math.random(), value: 22 };
             var expected3 = { key: 'val' + now + Math.random(), value: 33 };

             // first, do our setups
             var setup = carStash.removeAll()
             .then(function () {
                return carStash.set(expected1.key, expected1.value);
             }).then(function () {
                return carStash.set(expected2.key, expected2.value);
             }).then(function () {
                return peopleStash.set(expected3.key, expected3.value);
             });

             setup.then(function () {

                var testMethod = carStash.getAll();
                testMethod.then(function (value) {
                   assert.equal(value.length, 2, 'array contains correct number of items');
                   assert.ok(value.indexOf(expected1.value) > -1, 'first item is present');
                   assert.ok(value.indexOf(expected2.value) > -1, 'second item is present');
                   assert.ok(value.indexOf(expected3.value) === -1, 'third item should not be present');
                })
                .finally(start);

             }).fail(function (error) { console.error(error); });
          });
       };

       var runAccessTests = function (stash) {

          asyncTest("enduring stash 'set' adds a value if one doesn't exist", 2, function (assert) {


             console.log('another test, stash is ');
             console.log(stash);

             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             var test = stash.set(expected.key, expected.value);

             test.then(function () {

                var verify = stash.get(expected.key);
                verify.then(function (value) {
                   assert.equal(expected.value, value);
                   ok(!isNaN(value), 'returns number');
                }).finally(start);

             }).fail(start);
          });

          asyncTest("enduring stash 'set' updates a value if it already exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             var expected2 = expected;
             expected2.value = 5;

             var test = stash.set(expected.key, expected.value)
                 .then(stash.set(expected.key, expected2.value));

             test.then(function () {

                var verify = stash.get(expected.key);
                verify.then(function (actualValue) {
                   assert.equal(expected2.value, actualValue, 'should be equal');
                }).finally(start);

             }).fail(start);
          });

          asyncTest("enduring stash 'get' promise is resolved with undefined if no value exists", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: undefined };

             var test = stash.get(expected.key);
             test.then(function (value) {
                assert.equal(value, expected.value, 'get promise resolved');
             }).finally(start);
          });

          asyncTest("enduring stash 'getAll' promise is resolved with array of items", function (assert) {

             var setup = stash.removeAll()
               .then(function () {
                  var expected = { key: 'val' + (new Date()).getTime() + Math.random(), value: 5 };
                  var expectedArray = [];
                  var promises = [];

                  for (var i = 0; i < 10; i++) {
                     expectedArray.push(expected.value + i);
                     promises.push(stash.set(expected.key + i, expected.value + i));
                  }
                  return Q.allSettled(promises);
               });

             setup.then(function () {
                var test = stash.getAll();
                test.then(function (value) {
                   assert.equal(10, value.length, 'correct number of items returned');
                   assert.deepEqual(expectedArray, value);
                }).finally(start);

             }).fail(start);
          });

          asyncTest("enduring stash 'getAll' promise is resolved with an empty array if no values exists", function (assert) {

             var expectedArray = [];
             var setup = stash.removeAll()

             setup.then(function () {

                var test = stash.getAll();
                test.then(function (value) {
                   assert.equal(0, value.length, 'correct number of items returned');
                   assert.deepEqual(expectedArray, value);
                }).finally(start);

             }).fail(start);
          });

          asyncTest("enduring stash 'add' adds a value if one doesn't exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime() + Math.random(), value: 3.14 };

             var test = stash.add(expected.key, expected.value);
             test.then(function () {

                var verify = stash.get(expected.key)
                .then(function (value) {
                   assert.equal(value, expected.value, 'get promise resolved');
                }).finally(start);

             }).fail(start);
          });

          asyncTest("enduring stash 'add' does not update a value if it already exist", 2, function (assert) {
             var expected = { key: 'val' + (new Date()).getTime() + Math.random(), value: 3.14 };

             var setup = stash.add(expected.key, expected.value);
             setup.then(function () {
                var test = stash.add(expected.key, 22)
                   .fail(function (error) {
                      ok('promise was rejected');
                   }).then(function () {
                      stash.get(expected.key).then(function (value) {
                         assert.equal(value, expected.value, 'data should be unchanged');
                      });
                   }).finally(start);
             }).fail(start);
          });

          asyncTest("enduring stash 'update' promise rejected if item doesn't exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             var test = stash.update(expected.key, expected.value);

             test.fail(function (error) {
                ok('promise rejected');

             }).finally(start);
          });

          asyncTest("enduring stash 'update' does not add an item if it doesn't exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             var test = stash.update(expected.key, expected.value);

             test.then(start)
             .fail(function (error) {

                var verify = stash.contains(expected.key)
                  .then(function (value) {
                     assert.equal(value, false, "item still doesn't exist");
                  }).finally(start);
             });
          });

          asyncTest("enduring stash 'update' updates a value if it already exists", 2, function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };
             var expected2 = expected;
             expected2.value = 5;

             var setup = stash.set(expected.key, expected.value);
             setup.then(function () {

                var test = stash.update(expected.key, expected2.value);
                test.then(function () {
                   ok('promise resolved');

                   var verify = stash.get(expected.key);
                   verify.then(function (value) {
                      assert.equal(value, 5, 'value is updated');

                   }).finally(start);

                }).fail(start);
             }).fail(start);
          });

          asyncTest("enduring stash 'contains' returns true if an item exists", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             var setup = stash.set(expected.key, expected.value);
             setup.then(function () {

                var test = stash.contains(expected.key);
                test.then(function (value) {
                   assert.equal(value, true, 'contains promise fulfilled and returns true');
                }).finally(start);

             }).fail(start);
          });

          asyncTest("enduring stash 'contains' returns false if an item does not exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             var test = stash.contains(expected.key);
             test.then(function (value) {
                assert.equal(value, false, 'contains promise fulfilled and returns false');
             }).finally(start);
          });

          asyncTest("enduring stash 'remove' promise resolves and item is removed", 2, function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             var setup = stash.set(expected.key, expected.value);

             setup.then(function () {

                var test = stash.remove(expected.key);
                test.then(function () {

                   assert.ok('remove promise resolved');
                   var verify = stash.contains(expected.key);
                   verify.then(function (value) {
                      assert.equal(value, false, 'and now contains is false');
                   }).finally(start);

                }).fail(start);
             }).fail(start);
          });

          asyncTest("enduring stash 'remove' promise resolves with no action if an item does not exist", function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             var test = stash.remove(expected.key);
             test.then(function () {
                assert.ok('remove promise resolved');
             }).finally(start);

          });

          asyncTest("enduring stash 'removeAll' removes all items", 2, function (assert) {
             var expected = { key: 'val' + (new Date()).getTime(), value: 3.14 };

             var setup = stash.set(expected.key, expected.value);
             setup.then(function () {

                var test = stash.removeAll();
                test.then(function () {
                   ok('removeAll promise fulfilled');
                   var verify = stash.contains(expected.key);
                   verify.then(function (value) {
                      assert.equal(value, false, 'and now contains is false');
                   }).finally(start);

                }).fail(start);
             }).fail(start);
          });

       };

       var runDataTypeTests = function (stash) {

          var dataTypeTest = function (assert, expected) {
             stash.set('val', expected.value).then(function () {

                stash.get(expected.key).then(function (value) {
                   assert.deepEqual(value, expected.value, 'returns correct value');
                }).finally(start);

             }).fail(start);
          };

          asyncTest("enduring stash sets and gets a number", function (assert) {
             var expected = { key: 'val', value: 3.14 };
             dataTypeTest(assert, expected);
          });

          asyncTest("enduring stash sets and gets a number, 0", function (assert) {
             var expected = { key: 'val', value: 0 };
             dataTypeTest(assert, expected);
          });

          asyncTest("enduring stash sets and gets a string", function (assert) {
             var expected = { key: 'val', value: "Hello World" };
             dataTypeTest(assert, expected);
          });

          asyncTest("enduring stash gets and sets a string with special characters", function (assert) {
             var expected = { key: 'val', value: "Hello World\how\are\you\today" };
             dataTypeTest(assert, expected);
          });

          asyncTest("enduring stash sets and gets a regular expression", function (assert) {
             var expected = { key: 'val', value: /lorem|ipsum/ };
             dataTypeTest(assert, expected);
          });

          asyncTest("enduring stash sets and gets a true boolean", function (assert) {
             var expected = { key: 'val', value: true };
             dataTypeTest(assert, expected);
          });

          asyncTest("enduring stash sets and gets a false boolean", function (assert) {
             var expected = { key: 'val', value: false };
             dataTypeTest(assert, expected);

          });

          asyncTest("enduring stash sets and gets null", function (assert) {
             var expected = { key: 'val', value: null };
             dataTypeTest(assert, expected);
          });

          asyncTest("enduring stash sets and gets undefined", function (assert) {
             var expected = { key: 'val', value: undefined };
             dataTypeTest(assert, expected);
          });

          asyncTest("enduring stash sets and gets a date", function (assert) {
             var expected = { key: 'val', value: new Date() };
             dataTypeTest(assert, expected);
          });

          asyncTest("enduring stash sets and gets a complex object", function (assert) {
             var object = {
                name: "Operation Enduring Stash",
                created: new Date(),
                isAwesome: true,
                levelOfAwesomeness: 11,
                contributors: ["Sarah Henderson", "Maybe you?"]
             };
             var expected = { key: 'val', value: object };

             stash.set(expected.key, expected.value).then(function () {
                stash.get(expected.key).then(function (value) {

                   assert.deepEqual(value, object, 'object is good!');
                   assert.strictEqual(value.name, object.name, 'string is the same');
                   assert.deepEqual(value.created, object.created, 'date is the same');
                   assert.strictEqual(value.isAwesome, object.isAwesome, 'boolean is the same');
                   assert.strictEqual(value.levelOfAwesomeness, object.levelOfAwesomeness, 'number is the same');
                   assert.deepEqual(value.contributors, object.contributors, 'array is the same');
                }).finally(start);

             }).fail(start);
          });

          asyncTest("enduring stash sets and gets an array of complex objects", function (assert) {
             var array = [];
             array.push({ id: 1, name: "Enduring", created: new Date() });
             array.push({ id: 2, name: "Stash", created: new Date() });
             var expected = { key: 'val', value: array };

             stash.set(expected.key, expected.value).then(function () {

                stash.get(expected.key).then(function (value) {
                   assert.deepEqual(value[0], expected.value[0], 'first item is the same');
                   assert.deepEqual(value[1].name, expected.value[1].name, 'second item string is the same');
                   assert.deepEqual(value[1].created, expected.value[1].created, 'second item date is the same');
                }).finally(start);

             }).fail(start);
          });

       };

       return {
          run: run
       };
    }
);