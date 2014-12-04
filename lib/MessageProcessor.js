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
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.setLevel('DEBUG');

process_twitter_message = function(message) {
  logger.debug("process_twitter_message: " + message.text);
};

process_linkedin_message = function(message) {
  logger.debug("process_linkedin_message: " + message.summary);
};

process_instagram_message = function(message) {
  logger.debug("process_instagram_message: " + message.images.standard_resolution.url);
};

process_facebook_message = function(message) {
  logger.debug("process_facebook_message: " + message);
};

process_message_generic = function(message) {
  logger.debug("process_message_generic: " + message);
};

exports.worker = function(element, callback) {
  switch(element.type) {
    case 'twitter':
        process_twitter_message(element.message);
        callback();
        break;
    case 'instagram':
        process_instagram_message(element.message);
        callback();
        break;
    case 'linkedin':
        process_linkedin_message(element.message);
        callback();
        break;
      case 'facebook':
        process_facebook_message(element.message);
        callback();
        break;
    default:
        process_message_generic(element.message);
        callback();
  } 
};

exports.callback = function(err, result) {

};

exports.done = function() {

};
