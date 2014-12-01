/*
    Module that connects to instagram and sets up real-time subscriptions
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

var typeOf = require('typeof');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var ig = require('instagram-node').instagram();

// Configuration files
var basedir = "/home/hugo/workspace/SocialMediaMonitor";
var host_config_file = basedir + "/data/host_config.json";
var instagram_secrets_file = basedir + "/data/instagram_secrets.json";
var instagram_filter_file = basedir + "/data/instagram_filter.json";

var queue;
// Instagram objects already seen recently
var seen = {};

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.post('/tag', function(req, res) {
  var objects = req.body;
  logger.debug("Instagram tag subscription received data");
  objects.forEach(function(object) {
    /* OPTIONS: { [min_tag_id], [max_tag_id] }; */
    ig.tag_media_recent(object.object_id, function(err, medias, pagination, remaining, limit) {
      medias.forEach(function(media) {
        if (!seen[media.id]) { // Did we already see this media object?
          logger.debug("InstagramConnector: new image seen: " + media.images.standard_resolution.url);
          queue.push({"type": "instagram", "message": media});
          // Register that we saw this media object before
          seen[media.id] = true;
        }
      });
    });
  });
});

// http://your-callback.com/url/?hub.mode=subscribe&hub.challenge=15f7d1a91c1f40f8a748fd134752feb3&hub.verify_token=myVerifyToken
app.get('/tag', function(req, res) {
  logger.debug('Subscription handshake: /tag');
  var hub_challenge = req.param('hub.challenge');
  res.send(hub_challenge);
});

app.post('/geography', function(req, res) {
  var objects = req.body;
  logger.debug("Instagram geography subscription received data");
  objects.forEach(function(object) {
    // OPTIONS: { [min_id], [count] }
    ig.geography_media_recent(object.object_id, function(err, medias, pagination, remaining, limit) {
      if (medias) {
        medias.forEach(function(media) {
          if (!seen[media.id]) { // Did we already see this media object?
            logger.debug("InstagramConnector: geography subscription: new image seen: " + media.images.standard_resolution.url);
            queue.push({"type": "instagram", "message": media});
            // Register that we saw this media object before
            seen[media.id] = true;
          }
        });
      }
    });
  });
});

// http://your-callback.com/url/?hub.mode=subscribe&hub.challenge=15f7d1a91c1f40f8a748fd134752feb3&hub.verify_token=myVerifyToken
app.get('/geography', function(req, res) {
  logger.debug('Subscription handshake: /geography');
  var hub_challenge = req.param('hub.challenge');
  res.send(hub_challenge);
});

app.post('/user', function(req, res) {
  logger.debug("instagram: user subscription: ");
  logger.debug("instagram: " + req);
});

// http://your-callback.com/url/?hub.mode=subscribe&hub.challenge=15f7d1a91c1f40f8a748fd134752feb3&hub.verify_token=myVerifyToken
app.get('/user', function(req, res) {
  logger.debug('Subscription handshake: /user');
  var hub_challenge = req.param('hub.challenge');
  res.send(hub_challenge);
});

app.post('/location', function(req, res) {
  var objects = req.body;
  logger.debug("Instagram location subscription received data");
  objects.forEach(function(object) {
    // OPTIONS: { [min_id], [max_id], [min_timestamp], [max_timestamp] };
    ig.location_media_recent(this.instagram_filter.location_id, function(err, medias, pagination, remaining, limit) {
      medias.forEach(function(media) {
        logger.debug("InstagramConnecor: location subscription: new image seen: " + media.images.standard_resolution.url);
        if (!seen[media.id]) { // Did we already see this media object?
          queue.push({"type": "instagram", "message": media});
          // Register that we saw this media object before
          seen[media.id] = true;
        }
      });
    });
  });
});

// http://your-callback.com/url/?hub.mode=subscribe&hub.challenge=15f7d1a91c1f40f8a748fd134752feb3&hub.verify_token=myVerifyToken
app.get('/location', function(req, res) {
  logger.debug("Subscription handshake: /location");
  var hub_challenge = req.param('hub.challenge');
  res.send(hub_challenge);
});

function InstagramConnector(q) {
  var that = this;
  
  this.host_config = JSON.parse(fs.readFileSync(host_config_file, 'utf8'));
  
  // Assign q to the global queue
  queue = q;
  app.listen(this.host_config.port, function() {
    logger.debug("Listening on " + that.host_config.port);
  });
  
  // Read secrets from file
  this.instagram_secrets = JSON.parse(fs.readFileSync(instagram_secrets_file, 'utf8'));
  // Authenticate
  ig.use(this.instagram_secrets);
  
  // Read filter from file
  this.instagram_filter = JSON.parse(fs.readFileSync(instagram_filter_file, 'utf8'));
  logger.debug("Read Instagram filter: " + JSON.stringify(this.instagram_filter));

  // Remove existing subscriptions
  this.RemoveSubscriptions();
  
  // Register tag subscriptions
  if (this.instagram_filter.tag_subscription) {
    this.instagram_filter.tags.forEach(function(tag) {
      // OPTIONS: { [verify_token] }
      ig.add_tag_subscription(tag, that.host_config.hostname + '/tag', function(err, result, remaining, limit) {
        if (err) {
          logger.debug('Instagram subscription tag error: ' + err);
        }
        logger.debug('Instagram subscription for tags: ' + JSON.stringify(result));
      });
    });
  }
  
  // Register geography subscriptions
  if (this.instagram_filter.geography_subscription) {
    for (var i = 0; i < this.instagram_filter.geography_lons.length; i++) {
      // OPTIONS: { [verify_token] }
      ig.add_geography_subscription(this.instagram_filter.geography_lons[i],
                                    this.instagram_filter.geography_lats[i],
                                    this.instagram_filter.geography_radiuses[i],
                                    this.host_config.hostname + '/geography', function(err, result, remaining, limit) {
        if (err) {
          logger.debug('Instagram geography subscription error: ' + err);
        }
        else {
          logger.debug('Instagram geography subscription: (%s, %s, %s)', 
                      that.instagram_filter.geography_lons[i],
                      that.instagram_filter.geography_lats[i],
                      that.instagram_filter.geography_radiuses[i]);
          logger.debug("Instagram geography subscription: result: " + JSON.stringify(result));
        }
      });
    }
  }
  
  // Register user subscriptions
  if (this.instagram_filter.user_subscription) {
    // OPTIONS: { [verify_token] }
   ig.add_user_subscription(this.host_config.hostname + '/user', function(err, result, remaining, limit) {

   });
  }
 
  // Register location subscriptions
  if (this.instagram_filter.location_subscription) {
    this.instagram_filter.location_ids.forEach(function(location_id) {
      // OPTIONS: { [verify_token] }
      ig.add_location_subscription(location_id, that.host_config.hostname + '/location', function(err, result, remaining, limit) {
        if (err) {
          logger.debug("Instagram subscription for locations: error: " + err);
        }
        else {
          logger.debug("Instagram subscription for locations: " + JSON.stringify(result));
        }
      });
    });
  }
}

InstagramConnector.prototype.RemoveSubscriptions = function() {
  ig.del_subscription({ all: true }, function(err, subscriptions, remaining, limit) {
    //
  });
};

module.exports = InstagramConnector;