/*
    Module that connects to instagram and sets up some subscriptions
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

var ig = require('instagram-node').instagram();

var basedir = "/home/hugo/workspace/SocialMediaMonitor";
var instagram_secrets_file = basedir + "/data/instagram_secrets.json";
var instagram_filter_file = basedir + "/data/instagram_filter.json";

function InstagramConnector(queue) {
  // Read secrets from file
  this.instagram_secrets = JSON.parse(fs.readFileSync(instagram_secrets_file, 'utf8'));
  // Authenticate
  ig.use(this.instagram_secrets);
  
  // Read filter from file
  this.instagram_filter = JSON.parse(fs.readFileSync(instagram_filter_file, 'utf8'));
  
  // OPTIONS: { [verify_token] }
  ig.add_tag_subscription('funny', 'http://MYHOST/tag/funny', function(err, result, remaining, limit) {
    
  });

  // OPTIONS: { [verify_token] }
  ig.add_geography_subscription(48.565464564, 2.34656589, 100, 'http://MYHOST/geography', function(err, result, remaining, limit) {
    
  });

  // OPTIONS: { [verify_token] }
  ig.add_user_subscription('http://MYHOST/user', function(err, result, remaining, limit) {
    
  });

  // OPTIONS: { [verify_token] }
  ig.add_location_subscription(1257285, 'http://MYHOST/location/1257285', function(err, result, remaining, limit) {
    
  });
}

module.exports = InstagramConnector;
