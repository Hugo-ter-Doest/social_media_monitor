/*
    Module that creates a Twitter stream and connects it to a queue
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

var kue = require('kue');

function MessageProcessor(queue) {
  this.queue = queue;
  
  queue.on('job enqueue', function(id,type){
    console.log( 'job %s got queued', id );
    // Process message
    
  });
  
  queue.on('job complete', function(id, result) {
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
}

module.exports = MessageProcessor;
