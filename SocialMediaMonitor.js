/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//var http = require('http');
//http.createServer(function (req, res) {
//    res.writeHead(200, {
//        'Content-Type': 'text/plain; charset=UTF-8'
//    });
//    
//    res.end('Hello from SocialMediaMonitor.\n');
//    
//}).listen(9080, "");

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.setLevel('DEBUG');

var kue = require('kue');
var TwitterConnection = require('./lib/TwitterConnector');
var InstagramConnection = require('./lib/InstagramConnector');
var LinkedInConnection = require('./lib/LinkedInConnector');
var MessageProcessor = require('./lib/MessageProcessor');

message_queue = kue.createQueue();
logger.debug("Created queue");

var twitter = new TwitterConnection(message_queue);
logger.debug("Created Twitter connection");

var instagram = new InstagramConnection(message_queue);
logger.debug("Created Instagram connection");

var linkedin = new LinkedInConnection(message_queue);
logger.debug("Created LinkedIn connection");

var message_processor = new MessageProcessor(message_queue);
logger.debug("Created message processor");