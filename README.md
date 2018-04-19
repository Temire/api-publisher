[![Build Status](https://travis-ci.org/Trust1Team/api-publisher.svg?branch=develop)](https://travis-ci.org/Trust1Team/api-publisher) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/eef39aba9dd642b38630d048bd2ef628)](https://www.codacy.com/app/Trust1Team/api-publisher?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Trust1Team/api-publisher&amp;utm_campaign=Badge_Grade)

Trust1Gateway - Publisher: API Publisher for the Trust1Gateway
==============================================================
[![][t1g-logo]][Trust1Gateway-url]

Summary: Open source API manager build on [Kong](https://getkong.org/)
The API Publisher is an Angular application consuming the Trust1Gateway API Engine.
It's a convenient way for developers to register and expose APIs. You can easily configure
plans, policies, notifications for existing APIs.

Github project
--------------
Source: <https://github.com/Trust1Team/api-gateway>

Kong version
------------

![][kong-logo]

Using the open source Kong 0.10.1 (CE)

Documentation
-------------
We are working on the Trust1Gateway documentation:
[Trust1Gateway - Documentation](https://www.gitbook.com/book/t1t/trust1gateway-marketplace-guide/details)


## Running development server

### Installing dependencies
Run `yarn install` to install all dependencies. Use of Yarn is recommended, but `npm install` will work too if you don't have Yarn installed.

### Running
For development purposes, make sure your `config.yaml` file is up to date and the environment is set to "local" or "development".
You can then run `nodemon app.js` to start a nodemon process which watches for changes in the BFF (this assumes you have nodemon installed);
 Then run `grunt serve` to start a livereload server which watches for changes in the client.

## Building for deployment

Please see the [deployment guide](https://t1t.gitbooks.io/trust1gateway-architecture-deployment/content/deployment/t1g-publisher.html):.


## Testing

Running `grunt test` will run the unit tests with karma.



[Trust1Team-url]: https://trust1team.com
[Trust1Gateway-url]: https://www.trust1gateway.com
[Github-T1G]: https://github.com/Trust1Team/api-gateway
[t1t-logo]: http://imgur.com/lukAaxx.png
[t1c-logo]: http://i.imgur.com/We0DIvj.png
[t1g-logo]: https://i.imgur.com/zsGZaoC.png
[t1g-documentation]: https://www.gitbook.com/book/t1t/trust1gateway-marketplace-guide/details
[kong-logo]: https://i.imgur.com/ykM19BJ.png
[kong-uri]: https://getkong.org/



