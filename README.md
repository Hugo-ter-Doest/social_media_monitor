SocialMediaMonitor
==============

This is SocialMediaMonitor, a tool for monitoring social media like Twitter, Facebook and Instagram. It connects to these media and monitors for keywords, new messages in certain locations, messages from certain users. Keywords, locations, geographies, etc. are configurable.

It depends on nodejs libraries for social media:
* node-instagram
* node-twitter

It uses Kue for asynchronous processing of messages. Kue in turn depends on redis.