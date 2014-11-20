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

LinkedInConnector.prototype.process_data = function(data) {
  console.log("LinkedInConnector process data: " + JSON.stringify(data));
  
};

function LinkedInConnector(queue) {
  var that = this;
  this.queue = queue;
  
  // Read secrets from a file
  this.linkedin_secrets = JSON.parse(fs.readFileSync(linkedin_secrets_file, 'utf8'));
  
  // Authenticate
  this.linkedin = Linkedin.init(this.linkedin_secrets.access_token);
  
  // Read filter from a file
  this.linkedin_filter = JSON.parse(fs.readFileSync(linkedin_secrets_file, 'utf8'));
  
  // Create one or more news feeds
  this.linkedin_filter.feeds.forEach(function(feed) {
    linkedin.group.feeds(feed, function(err, data) {
      // put data in the queue
      that.process_data(data);
    });
  });
}

module.exports = LinkedInConnector;
