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

var typeOf = require('typeof');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var ig = require('instagram-node').instagram();

var basedir = "/home/hugo/workspace/SocialMediaMonitor";
var instagram_secrets_file = basedir + "/data/instagram_secrets.json";
var instagram_filter_file = basedir + "/data/instagram_filter.json";

var myhost = "http://82.74.150.76";
var port = 3000;

var queue;
// Instagram objects already seen recently
var seen = {};

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.post('/tag', function(req, res) {
  var objects = req.body;
  console.log("Instagram tag subscription received data: " + JSON.stringify(objects));
  var job = queue.create('instagram', req.body).save(function(err) {
    if(!err) {
      if (typeOf(objects) === "array") { // multiple objects
        objects.forEach(function(object) {
          /* OPTIONS: { [min_tag_id], [max_tag_id] }; */
          ig.tag_media_recent(object.object_id, function(err, medias, pagination, remaining, limit) {
            medias.forEach(function(media) {
              if (!seen[media.id]) { // Did we already see this media object?
                var job = queue.create('instagram', media).save( function(err){
                  if(!err) {
                    //console.log(job.id);
                  }
                });
              }
              // Register that we saw this media object before
              seen[media.id] = media;
            });
          });
        });
      }
      else { // only one object
        /* OPTIONS: { [min_tag_id], [max_tag_id] }; */
        ig.tag_media_recent('tag', function(err, medias, pagination, remaining, limit) {});
      }
    }
  });
});

// http://your-callback.com/url/?hub.mode=subscribe&hub.challenge=15f7d1a91c1f40f8a748fd134752feb3&hub.verify_token=myVerifyToken
app.get('/tag', function(req, res) {
  console.log('Subscription handshake: /tag');
  var hub_challenge = req.param('hub.challenge');
  res.send(hub_challenge);
});

app.post('/geography', function(req, res) {
  console.log("instagram: geography subscription: ");
  console.log("instagram: " + req);
});

// http://your-callback.com/url/?hub.mode=subscribe&hub.challenge=15f7d1a91c1f40f8a748fd134752feb3&hub.verify_token=myVerifyToken
app.get('/geography', function(req, res) {
  console.log('Subscription handshake: /geography');
  var hub_challenge = req.param('hub.challenge');
  res.send(hub_challenge);
});

app.post('/user', function(req, res) {
  console.log("instagram: user subscription: ");
  console.log("instagram: " + req);
});

// http://your-callback.com/url/?hub.mode=subscribe&hub.challenge=15f7d1a91c1f40f8a748fd134752feb3&hub.verify_token=myVerifyToken
app.get('/user', function(req, res) {
  console.log('Subscription handshake: /user');
  var hub_challenge = req.param('hub.challenge');
  res.send(hub_challenge);
});

app.post('/location', function(req, res) {
  console.log("instagram: location subscription: ");
  console.log("instagram: " + req);
});

// http://your-callback.com/url/?hub.mode=subscribe&hub.challenge=15f7d1a91c1f40f8a748fd134752feb3&hub.verify_token=myVerifyToken
app.get('/location', function(req, res) {
  console.log('Subscription handshake: /location');
  var hub_challenge = req.param('hub.challenge');
  res.send(hub_challenge);
});

function InstagramConnector(q) {
  queue = q;
  app.listen(port, function() {
    console.log("Listening on " + port);
  });
  
  // Read secrets from file
  this.instagram_secrets = JSON.parse(fs.readFileSync(instagram_secrets_file, 'utf8'));
  // Authenticate
  ig.use(this.instagram_secrets);
  
  // Read filter from file
  this.instagram_filter = JSON.parse(fs.readFileSync(instagram_filter_file, 'utf8'));
  
  // OPTIONS: { [verify_token] }
  ig.add_tag_subscription('funny', myhost + '/tag', function(err, result, remaining, limit) {
    if (err) {
      console.log('Instagram subscription tag error: ' + err);
    }
    console.log('Instagram subscription for tags: ' + 'funny');
  });

  // OPTIONS: { [verify_token] }
  ig.add_geography_subscription(48.565464564, 2.34656589, 100, myhost + '/geography', function(err, result, remaining, limit) {
    
  });

  // OPTIONS: { [verify_token] }
  ig.add_user_subscription(myhost + '/user', function(err, result, remaining, limit) {
    
  });

  // OPTIONS: { [verify_token] }
  ig.add_location_subscription(1257285, myhost + '/location', function(err, result, remaining, limit) {
    
  });
}

InstagramConnector.prototype.RemoveSubscriptions = function() {
  ig.del_subscription({ all: true }, function(err, subscriptions, remaining, limit) {
    //
  });
};

module.exports = InstagramConnector;
