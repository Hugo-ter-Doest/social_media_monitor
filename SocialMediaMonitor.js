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

var kue = require('kue');
var TwitterConnection = require('./lib/TwitterConnector');
var InstagramConnection = require('./lib/InstagramConnector');
var LinkedInConnection = require('./lib/LinkedInConnector');
var MessageProcessor = require('./lib/MessageProcessor');

message_queue = kue.createQueue();
console.log("Created queue");

var twitter = new TwitterConnection(message_queue);
console.log("Created Twitter connection");

var instagram = new InstagramConnection(message_queue);
console.log("Created Instagram connection");

var linkedin = new LinkedInConnection(message_queue);
console.log("Created LinkedIn connection");

var message_processor = new MessageProcessor(message_queue);
console.log("Created message processor");