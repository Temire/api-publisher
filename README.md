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

For development purposes you can run `grunt serve` to start a livereload server with configuration for API Publisher, or run `grunt serve:mkt` to start a server with a profile for API Store.
Both of these will run against the online dev backend.

Run `grunt serveLocal` for a local docker machine, or a local API Engine.


## Building for deployment

There are build profiles available for many different environments, these can be found in the `Gruntfile.js` file.
Find the build profiles you want to use (for example `pub` for the publisher in dev), and then run `grunt <buildprofile>`, so for our example that would be `grunt pub`.

Once the build process completes, you will find the files to be deployed in the `dist` folder, as well as a .zip file containing the deployable.


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



