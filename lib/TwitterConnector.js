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

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.setLevel('DEBUG');

var twitter = require('twitter');
var fs = require('fs');

var basedir = "/home/hugo/workspace/SocialMediaMonitor";
var twitter_secrets_file = basedir + "/data/twitter_secrets.json";
var twitter_filter_file = basedir + "/data/twitter_filter.json";

// Constructor that accepts a queue for Twitter messages
function TwitterConnector(queue) {
  // read secrets from a file
  this.twitter_secrets = JSON.parse(fs.readFileSync(twitter_secrets_file, 'utf8'));
  // create twitter connection
  this.connection = new twitter(this.twitter_secrets);
  // read the filter from a file
  this.twitter_filter = JSON.parse(fs.readFileSync(twitter_filter_file, 'utf8'));
  this.connection.stream('filter', this.twitter_filter, function(stream) {
    stream.on('data', function(data) {
      logger.debug("Twitter: data received: " + data.text);
      // message is saved as a job of type twitter
      queue.push({"type:":"twitter", "message": data});
    });
  });
}

module.exports = TwitterConnector;