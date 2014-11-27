/*
    Module that creates a LinkedIn connection, subscribes to feeds,
      and saves messages to a queue
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
https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=undefined&scope=r_basicprofile%20r_fullprofile%20r_emailaddress%20r_network%20r_contactinfo%20rw_nus%20rw_groups%20w_messages&state=RNDM_K49DEVnWF4jcMlAjAu&redirect_uri=http://localhost:1337/callback/

var http = require('http');
var https = require('https');
var url = require('url');
var fs = require("fs");

var basedir = "/home/hugo/workspace/SocialMediaMonitor";
var linkedin_secrets_file = basedir + "/data/linkedin_secrets.json";
var linkedin_filter_file = basedir + "/data/linkedin_filter.json";

var myhost = "http://localhost";
var port = "1337";

// Change your API keys received from developer.linkedin.com below
var callbackURL = myhost + ":" + port + "/callback/";
var APIVersion = "v1";
// These are all of the scope variables. Remove them based on your needs
var APIScope = 'r_basicprofile r_fullprofile r_emailaddress r_network r_contactinfo rw_nus rw_groups w_messages';
//var APIScope = 'r_basicprofile';

// Some Example API Calls
// More information can be found here: http://developer.linkedin.com/rest
var APICalls = [];
// My Profile and My Data APIS
APICalls['myProfile'] = 'people/~:(first-name,last-name,headline,picture-url)';
APICalls['myConnections'] = 'people/~/connections';
APICalls['myNetworkShares'] = 'people/~/shares';
APICalls['myNetworksUpdates'] = 'people/~/network/updates';
APICalls['myNetworkUpdates'] = 'people/~/network/updates?scope=self';
// PEOPLE SEARCH APIS
// Be sure to change the keywords or facets accordingly
APICalls['peopleSearchWithKeywords'] = 'people-search:(people:(id,first-name,last-name,picture-url,headline),num-results,facets)?keywords=Hacker+in+Residence';
APICalls['peopleSearchWithFacets'] = 'people-search:(people,facets)?facet=location,us:84';
// GROUPS APIS
// Be sure to change the GroupId accordingly
APICalls['myGroups'] = 'people/~/group-memberships?membership-state=member';
APICalls['groupSuggestions'] = 'people/~/suggestions/groups';
APICalls['groupPosts'] = 'groups/631/posts:(title,summary,creator)?order=recency';
APICalls['groupDetails'] = 'groups/12345:(id,name,short-description,description,posts)';
// COMPANY APIS
// Be sure to change the CompanyId or facets accordingly
APICalls['myFollowingCompanies'] = 'people/~/following/companies';
APICalls['myFollowCompanySuggestions'] = 'people/~/suggestions/to-follow/companies';
APICalls['companyDetails'] = 'companies/1337:(id,name,description,industry,logo-url)';
APICalls['companySearch'] = 'company-search:(companies,facets)?facet=location,us:84';
// JOBS APIS
// Be sure to change the JobId or facets accordingly
APICalls['myJobSuggestions'] = 'people/~/suggestions/job-suggestions';
APICalls['myJobBookmarks'] = 'people/~/job-bookmarks';
APICalls['jobDetails'] = 'jobs/1452577:(id,company:(name),position:(title))';
APICalls['jobSearch'] = 'job-search:(jobs,facets)?facet=location,us:84';

var seen = {};

// Set up authentication for LinkedIn API
LinkedInConnector.prototype.Initialise = function(callback) {
  var that = this;
  
  // Create your API server
  http.createServer(function (req, response) {
  // Make sure the browser isn't requesting a /favicon.ico
    if (req.url !== '/favicon.ico') {
    // Check to see if authorization for end user has already been made and skip Oauth dance
      var cookies = {};
      req.headers.cookie && req.headers.cookie.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = (parts[ 1 ] || '').trim();
      });
      // If we have the access_token in the cookie skip the Oauth Dance and go straight to Step 3
      if (cookies['LIAccess_token']) {
        that.access_token = cookies['LIAccess_token'];
        callback();
      } else {
        var queryObject = url.parse(req.url, true).query;
        if (!queryObject.code) {
            // STEP 1 - If this is the first run send them to LinkedIn for Auth
            OauthStep1(req, response);
        } else {
          // STEP 2 - If they have given consent and are at the callback do the final token request
          OauthStep2(req, response, queryObject.code, function() {
            console.log("access_token = " + that.access_token);
            callback();
          });
        }
      }
    }
    // Ensure your server's listening port matches your callbackURL port on Line 11 above
  }).listen(port);
  console.log('Visit %s in your browser to test the LinkedIn Oauth2 API Authentication', myhost + ":" + port);

  var RandomState = function (howLong) {
    howLong = parseInt(howLong);
    if (!howLong || howLong <= 0) {
      howLong = 18;
    }
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
    for (var i = 0; i < howLong; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  // Oauth Step 1 - Redirect end-user for authorization
  var OauthStep1 = function (req, response) {
    console.log("Step1");
    response.writeHead(302, {
      'Location': 'https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=' + 
        that.linkedin_secrets.API_key + '&scope=' + APIScope + '&state=RNDM_' + RandomState(18) + '&redirect_uri=' + callbackURL
    });
    response.end();
  };

  // Oauth Step 2 - The callback post authorization
  var OauthStep2 = function (request, response, code, callback) {
    console.log("Step2");
    var options = {
      host: 'api.linkedin.com',
      port: 443,
      path: "/uas/oauth2/accessToken?grant_type=authorization_code&code=" + code + "&redirect_uri=" + callbackURL 
              + "&client_id=" + that.linkedin_secrets.API_key + "&client_secret=" + that.linkedin_secrets.API_secret
    };
    var req = https.request(options, function (res) {
      res.on('data', function (d) {
        var API_result = JSON.parse(d);
        if ((API_result) && (API_result.access_token)) {
          that.access_token = JSON.parse(d).access_token;
          console.log("OauthStep2: access_token = " + that.access_token);
        
          var ExpiresIn29days = new Date();
          ExpiresIn29days.setDate(ExpiresIn29days.getDate() + 29);
          response.writeHead(200, {'Set-Cookie': 'LIAccess_token=' + 
            that.access_token + '; Expires=' + ExpiresIn29days});
          callback();
        }
      });
    });
    req.on('error', function (e) {
      console.error("There was an error with our Oauth Call in Step 2: " + e);
      response.end("There was an error with our Oauth Call in Step 2");
    });
    req.end();
  };
};

// LinkedIn API call
LinkedInConnector.prototype.API_call = function(APICall, callback) {
 
  if (APICall.indexOf("?") >= 0) {
    var JSONformat = "&format=json";
  } else {
    var JSONformat = "?format=json";
  }
  
  var options = {
    host: 'api.linkedin.com',
    port: 443,
    path: '/' + APIVersion + '/' + APICall + JSONformat + "&oauth2_access_token=" + this.access_token
  };
  
  var req = https.request(options, function (res) {
    var data = "";

    res.on('data', function (chunk) {
        console.log(chunk);
        data += chunk;
    });

    res.on('end', function(){
        callback(JSON.parse(data));
    });
  });
  
  req.on('error', function (e) {
    console.error("There was an error with our LinkedIn API Call: " + e);
  });
  
  req.end();
};

LinkedInConnector.prototype.process_group_posts = function(posts) {
  var that = this;
  
  posts.forEach(function(post) {
    that.linkedin_filter.keywords.forEach(function(keyword) {
      if (post.summary.indexOf(keyword) !== -1) {
        // append the message to the queue
        if (!seen[post.summary]) {
          var job = that.queue.create('linkedin', post).save( function(err) {
            console.log("LinkedInConnector.process_group_posts: added new post: " + JSON.stringify(post));
            if(!err) {
              // Register that we saw this media object before
              seen[post.summary] = true;
            }
          });
        }
      }
    });
  });
};

LinkedInConnector.prototype.get_group_posts = function() {
  var that = this;
  
  this.linkedin_filter.groups.forEach(function(group){
    var API_call = "groups/" + group.id + "/posts:(title,summary,creator)?order=recency";
    that.API_call(API_call, function(result) {
      that.process_group_posts(result.values);
    });
  });
};

function LinkedInConnector(queue) {
  var that = this;
  this.queue = queue;
  
  // Read secrets from a file
  this.linkedin_secrets = JSON.parse(fs.readFileSync(linkedin_secrets_file, 'utf8'));
  // Read filter from a file
  this.linkedin_filter = JSON.parse(fs.readFileSync(linkedin_filter_file, 'utf8'));

  // Initialise connection with LinkedIn
  this.Initialise(function() {
    // Pull group feeds periodically each 3 seconds
    setInterval(function() {that.get_group_posts();}, 3000);
  });
}

module.exports = LinkedInConnector;
