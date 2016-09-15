/* global require console process it describe after before */

// these tests are for a user, but not one with admin privs

var should = require('should')
require('should-http')

var superagent = require('superagent')
var _ = require('lodash');
var hpms_routes = require('../.').hpms_routes


var http = require('http')
var express = require('express')

var config_okay = require('config_okay')

var testhost =  '127.0.0.1'
var testport =  3000

var path = require('path')
var rootdir = path.normalize(__dirname)
var config_file = rootdir+'/../test.config.json'

var config
before(function(done){
    config_okay(config_file,function(err,c){
        config ={'postgresql':c.postgresql}

        return done()
    })
    return null
})


describe ('hpms routes service', function(){
    var app,server;

    before(
        function(done){
            app = express()
            hpms_routes(config.postgresql,app)
            server=http
                   .createServer(app)
                   .listen(testport,done)

        })
    after(function(done){
        server.close()
        return done()
    })

    it('should spit out hpms links in a bbox defined by zoom, column, row'
      ,function(done){
           // load the service for vds shape data
           superagent.get('http://'+ testhost +':'+testport+'/hpms/links/14/2821/6558.json')
           .set({'accept':'application/json'
                ,'followRedirect':true})
           .end(function(e,r){
               if(e) return done(e)
               //console.log(r)
               r.should.have.status(200)
               var c = r.body
               c.should.have.property('type','FeatureCollection')
               c.should.have.property('features')
               c.features.should.have.property('length')
               c.features.length.should.be.above(530)

               var member = c.features[0]
               member.should.have.property('geometry')
               member.should.have.property('properties')
               member.properties.should.have.property('id')

               member.properties.should.have.property('to')
               member.properties.should.have.property('from')
               member.properties.should.have.property('city')
               member.properties.should.have.property('hpms_id')
               member.properties.should.have.property('geo_id')
               member.properties.should.have.property('year')
               member.properties.should.have.property('linkname')

               return done()
           })
       })

    it('should not work at zoom level 11 or lower'
      ,function(done){
           // load the service for vds shape data
           superagent.get('http://'+ testhost +':'+testport+'/hpms/links/11/353/820.json')
           .set({'accept':'application/json'})
           .end(function(e,r){
               if(e) return done(e)
               r.should.have.status(200)
               var c = r.body
               //console.log(c)
               c.should.eql({})
               return done()
           })
       })

})

describe ('hpms routes service with where clause', function(){
    var app,server,_testport=testport + 1;
    before(
        function(done){
            app = express()
            hpms_routes(_.extend(
                config.postgresql
                ,{'where_clause':'year_record=2009'})
                        ,app)
            server=http
                   .createServer(app)
                   .listen(_testport,done)

        })
    after(function(done){
        server.close()
        return done()
    })

    it('should spit out hpms links in a bbox defined by zoom, column, row'
      ,function(done){
           // load the service for vds shape data
           superagent.get('http://'+ testhost +':'+_testport+'/hpms/links/14/2821/6558.json')
           .set({'accept':'application/json'})
           .end(function(e,r){
               if(e) return done(e)
               r.should.have.status(200)
               var c = r.body
               c.should.have.property('type','FeatureCollection')
               c.should.have.property('features')
               c.features.should.have.property('length')
               c.features.length.should.be.above(270)
               _.each(c.features
                     ,function(member){
                          member.should.have.property('geometry')
                          member.should.have.property('properties')
                          member.properties.should.have.property('id')

                          member.properties.should.have.property('to')
                          member.properties.should.have.property('from')
                          member.properties.should.have.property('city')
                          member.properties.should.have.property('hpms_id')
                          member.properties.should.have.property('geo_id')
                          member.properties.should.have.property('linkname')
                          member.properties.should.have.property('year',2009)
                      })

                   return done()
           })
       })

})
