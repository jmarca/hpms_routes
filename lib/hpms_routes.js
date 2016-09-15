/* global exports JSON __dirname require process */

var path = require('path')
var assets_dir = path.normalize(__dirname+'/..')
var hpms_links = require('./hpms_links').hpms_links
//var express = require('express)

// set the routes
exports.hpms_routes = function hpms_routes(options,app){
    var handler = options.handler || hpms_links(options)
    var route = options.route || '/hpms/links/:zoom/:column/:row.:format?'
    app.get(route
           ,function(req,res,next){
                if(req.params.zoom < 12){
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({}));
                    return null;
                }
                return next();
            }
           ,function(req,res,next){
                return handler(req,res,next)
            }
           )
    // // and serve static files too
    // app.get(/\/hpms(\/.*)?/
    //          ,express.static(assets_dir)
    //         );
    return app;
}
