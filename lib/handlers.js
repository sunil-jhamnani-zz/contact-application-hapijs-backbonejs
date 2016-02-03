/**  * Created by sunil.jhamnani on 1/20/16.  */
var fs = require('fs'),
	Joi = require('joi'),
	Boom = require('boom'),
	Bcrypt = require('bcrypt'),
	mongoose = require('mongoose'),
	Users = require('../db/models/userModel');
	Contacts = require('../db/models/contactModel');

var Handlers = {};

var ContactSchema = Joi.object().keys({
	name: Joi.string().min(2).max(40).required(),
	email: Joi.string().email().required(),
	phone: Joi.string().min(5).max(12).required(),
	skypeid: Joi.string().min(3).max(15).required()
});

var loginSchema = Joi.object().keys({
	email: Joi.string().required(),
	password: Joi.string().required()
});

Handlers.newContactHandler = function(request, reply) {
    Joi.validate(request.payload, ContactSchema, function(err, val) {
        if(err) {
            return reply(Boom.badRequest(err.details[0].message));
        }
         var contact = new Contacts({
            name :val.name,
            email :val.email,
            phone:val.phone,
            skypeid :val.skypeid
        }).save(function(err,docs){
            if(err) throw err;
            reply(docs);
        });
    });
}
                 
Handlers.getUserHandler = function(request, reply){
	Users.findOne({_id:request.params.id},function(err,user){
		if (err){
			reply(err)
		}
		else {
			reply(user);
		}
	});
};

Handlers.loginHandler = function(request, reply) {
	if (request.auth.isAuthenticated) {
		return reply(request.cookieAuth.get(sid));
	}
    
    if(request.method === 'get'){
        console.log("redirectin to login");
        reply.redirect('/#login');
    }
	if (request.method === 'post') {
        console.log(request.payload);
		Joi.validate(request.payload, loginSchema, function (err, val) {
			if (err) {
				return reply(Boom.unauthorized('Credentials did not validate'));
			}
			validate(val.email, val.password, function (err, user) {
				if (err) {
					return reply(err);
				}
				const sid = String(user._id);
				request.server.app.cache.set(sid, { account: user }, 0, function(err){
					if (err){
						return reply(err);
					}
					request.cookieAuth.set({sid: sid});
					reply(user);
				});
			});
		});
	}
};

Handlers.showContactsHandlder = function(request, reply) {
	Contacts.find(function(err,contacts){
		if (err){
			console.log(err);
		}
		reply(contacts);
	})
}

Handlers.deleteContactHandler = function(request, reply) {
    var id = request.params.id;
    Contacts.findById(id,function(err,contact){
       contact.remove(function(err){
           throw err;
       })
       reply(contact);
    });
}

Handlers.editContactHandler = function(request,reply) {
    var id = request.params.id;
     Contacts.findById(id,function(err,contact){
         contact.name = request.payload.name;
         contact.email = request.payload.email;
         contact.phone = request.payload.phone;
         contact.skypeid = request.payload.skypeid;
         contact.save(function(err){
             if (err) throw err;
             reply(contact);
         });
    });
}

var validate = function (email, password, callback) {

	Users.findOne({email: email},function (err,user){
		if (err){
			callback(Boom.badRequest(err.details[0].message))
		}
		if (!user){
			callback(Boom.notFound("No user with this username was found"));
		}
		else {
			Bcrypt.compare(password, user.password, function(err, isValid) {
				if (!isValid){
					callback(err);
				}
				else {
					callback(null,user);
				}
			});
		}
	});
};

module.exports = Handlers;