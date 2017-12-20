/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Todos } from '../todos.js';
import { TestCol } from '../todos.js';
import { Lists } from '../../lists/lists.js';

Meteor.publishComposite('todos.inList', function todosInList(params) {
  new SimpleSchema({
    listId: { type: String },
  }).validate(params);

  const { listId } = params;
  const userId = this.userId;

  return {
    find() {
      const query = {
        _id: listId,
        $or: [{ userId: { $exists: false } }, { userId }],
      };

      // We only need the _id field in this query, since it's only
      // used to drive the child queries to get the todos
      const options = {
        fields: { _id: 1 },
      };

      return Lists.find(query, options);
    },

    children: [{
      find(list) {
        return Todos.find({ listId: list._id }, { fields: Todos.publicFields });
      },
    }],
  };
});

Meteor.publish('testcol', function() {
  return TestCol.find({});
});


Meteor.methods({
  myBatchJobFillDatabase(count) {
    check(count, Number);
    console.log("Creating "+ count + " items.");
    for (var i = 0; i < count; ++i) {
      TestCol.insert({
        name: "hejsan",
        a: "testProp-a",
        b: "testProp-a",
        c: "testProp-a",
        d: "testProp-a"
      });
    }
  },
  myBatchJobUpdate(name) {
    check(name, String);
    var ids = TestCol.find({}, {fields: {_id: 1}}).fetch();
    var j = 0;
    for(var i = ids.length - 1; i >= 0; --i) {
      TestCol.update(ids[i], {$set: {name: name}});
      let start = new Date();
      var item = TestCol.findOne(ids[i]);
      let end = new Date() - start;
      console.log(`Find item with id=${item._id} took time=${end} ms`);
      ++j;
    }
  }
});