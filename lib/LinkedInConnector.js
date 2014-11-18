/*
    Module that creates a LinkedIn connection and saves messages to a queue
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

var Linkedin = require('node-linkedin')('api', 'secret', 'callback');

function LinkedInConnector(queue) {
  this.queue = queue;
  
  // Read secrets from a file
  
  // Authenticate
  
  // Create one or more news feeds
  linkedin.group.feeds(3769732, function(err, data) {
    // put data in the queue
  });
}

module.exports = LinkedInConnector;
