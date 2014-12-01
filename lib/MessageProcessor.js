/*
    Module that processes social media messages from a queue
    Copyright (C) 2014 Hugo W.L. ter Doest

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var Queue = require('SimpleQueue');

var chart_parsers_basedir = '/home/hugo/workspace/chart_parsers';
var Grammar = require(chart_parsers_basedir + '/lib/GrammarParser');
var LeftCornerParser = require(chart_parsers_basedir + '/lib/LeftCornerParser');

MessageProcessor.prototype.process_twitter_message = function(job, done) {
  var parse_trees = {};
  var semantics = {};
  
  
  job.data.structure = parse_trees;
  job.data.meaning = semantics;
  job.save(function(err) {
    if(!err) {
      //console.log(job.id);
    }
  });
};

function MessageProcessor(queue) {
  var that = this;
  this.queue = queue;
  
  this.queue.on('job enqueue', function(id, type){
    console.log( 'job %s got queued', id );
    // Process message
    
  });
  
  this.queue.on('job complete', function(id, result) {
    kue.Job.get(id, function(err, job) {
      if (err) {
        return;
      }
      job.remove(function(err) {
        if (err) {
          throw err;
        }
        console.log('removed completed job #%d', job.id);
      });
    });
  });
  
  queue.process('twitter', function(job, done){
    that.process_twitter_message(job, done);
  });
}

exports.worker = function(element, callback) {

};

exports.callback = function(err, result) {

};

exports.done = function() {

};
