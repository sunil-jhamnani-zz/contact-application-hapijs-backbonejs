/**  * Created by sunil.jhamnani on 1/20/16.  */
'use strict';
 var hapi = require('hapi'), 
    assert = require('assert'), 
    mongoose = require('mongoose'),
    Handlers = require('./lib/handlers');
var db = mongoose.connect("mongodb://localhost:27017/Contacts");

const users = {
    john: {
        id: 'john',
        password: 'password',
        name: 'John Doe'
    }
};

const logout = function (request, reply) {

    request.cookieAuth.clear();
    return reply.redirect('/');
};

const server = new hapi.Server();
server.connection({ port: 3000 });

server.register(require('hapi-auth-cookie'), function(err) {

    if (err) {
        throw err;
    }

    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 });
server.app.cache = cache;

server.auth.strategy('session', 'cookie', true, {
    password: 'secret',
    cookie: 'sid-example',
    redirectTo: '/login',
    isSecure: false,
    validateFunc: function (request, session, callback) {
        console.log(request.auth);
        console.log(session);
        cache.get(session.sid, function(err, cached) {

            if (err) {
                return callback(err, false);
            }

            if (!cached) {
            return callback(null, false);
        }

        return callback(null, true, cached.account);
    });
    }
});

server.route([
    //{ method: 'GET', path: '/', config: { handler: home } },
    { method: ['GET', 'POST'], path: '/login', config: { handler: Handlers.loginHandler, auth: { mode: 'try' }, plugins: { 'hapi-auth-cookie': { redirectTo: false } } } },
    { method: 'GET', path: '/logout', config: { handler: logout } }
]);
});

server.register([require('inert')], function(err){ });
var Routes = [ 
    { 
        path: '/contacts', 
        method: 'GET', 
        handler: Handlers.showContactsHandlder
    },
    {
        path: '/contacts', 
        method: 'POST', 
        handler: Handlers.newContactHandler
    },
    {
        path: '/contacts/{id}',
        method: 'DELETE',
        handler: Handlers.deleteContactHandler
    },
    {
        path: '/contacts/{id}',
        method: 'PUT',
        handler: Handlers.editContactHandler 
    },
    { 
        path: '/{path*}', 
        method: 'GET', 
        handler: { 
            directory: { 
                path: 'public' 
            } 
        },
        config: {
            auth:false
        }
    } 
   ];
server.route(Routes);

server.start(function(){
    console.log("Listening to the URL: "+ server.version + server.info.uri);
});