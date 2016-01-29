# Web Sockets vs XHR Showdown

This tool provides a starting point for engineers to compare the power consumption of websockets and XMLHttpRequests in web applications. Clicking the deploy to Heroku button will spin up a dyno capable of serving the test website and receiving data via websockets and an API endpoint.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## How Does The Test Work?
Connected clients send a heartbeat packet to the server either via a secure web socket connection or XHR which contains information about their User Agent, battery level, and other placeholder content to bulk up the packet size. User's are encouraged to extend the heartbeat packet as needed to ensure an accurate test for their particular use case.

When the server receives a packet, a postgres database records the testID, userAgent, time of receipt, and the battery level (if available). This data can then be queried (eventually by the front end) to determine average battery consumption across a broad range of browsing contexts.

## How Is Battery Level Determined?
The user's battery level is determined using the [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API). Not all devices or browsers support this API. In the event a device's battery level cannot be obtained the user will be thanked for their interest in the test and told why they are unable to participate. If the device is actively being charged, the user will be prompted to unplug the charging cable.

## Alternative Uses For This Repo
If you're curious to start playing with NodeJS and collecting data in Postgres on Heroku this repo will hopefully serve as a good starting point. It is deliberately verbose and devoid of tooling in an effort to be adaptable. Feel free to ask questions by [opening issues](https://github.com/MattSurabian/ws-vs-xhr/issues). The following links may also be useful:

  - [Heroku Postgres](https://devcenter.heroku.com/articles/heroku-postgresql): If you use the Heroku Deploy button above, your database will be automatically configured using the `db_setup.js` script, but it does nothing to setup a local mirror for active development. This document talks about how to do that.
  - [Heroku Button Deployment](https://blog.heroku.com/archives/2014/8/7/heroku-button): This page talks about how the above Heroku Button works. You can also review this repo's [app.json file](https://github.com/MattSurabian/ws-vs-xhr/blob/master/app.json).