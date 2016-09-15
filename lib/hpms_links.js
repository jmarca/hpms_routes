/* global exports require process */
// deploy shape (linestring) service for the HPMS link data
//
// route will be /hpms/links/zoom/row/col or whatever, .json
//
// and eventually  .kml too, I can handle that now
//
//
//

var _ = require('lodash')
var shape_service = require('shapes_postgis').shape_geojson_generation


// options: options, or use environment variables
// * options.host:  the database host || process.env.PSQL_USER. Default 127.0.0.1
// * options.port:  the database port || process.env.PSQL_PASS. Default 5432
// * options.username: the db user    || process.env.PSQL_HOST. Required
// * options.password: the db user's password  || process.env.PSQL_PORT. Required

// app must be an express app

/**
 * hpms_links app
 * @param {Object} options
 * @param {string} options.host - the postgresql server host address
 * @param {Object} options.auth - authorization details
 * @param {string} options.auth.username - the postgresql user name
 * @param {string} options.auth.password - the password.  don't use this; instead use a value saved in .pgpass.  This is only here if that doesn't work.
 * @param {integer} options.port -  psql port
 * @param {string} options.db - the database to query, default "spatialvds"
 * @param {string} options.table - the table to query, default "hpms.hpms_data"
 * @param {string} options.alias - the alias for the table to query, default "hg"
 * @param {string} options.select_properties - the select properties to query, default is
 * {'link_desc'    : 'linkname'
 *  ,'from_name'   :'from'
 *  ,'to_name'     : 'to'
 *  ,'locality'    : 'city'
 *  ,'year_record' : 'year'
 *  ,'hd.id'       : 'hpms_id'
 *  ,'hg.id'       : 'geo_id'
 *  }
 * @param {string} options.id_col - the id column to query, default is hpms_id
 * @param {string} options.geo_col - the geo column to query, default is "hg.geom"
 * @param {string} options.join_tables - the join_tables to query, default is:
 * [ {'table':'hpms.hpms_link_geom'
 *     ,'alias':'hlg'
 *     ,'join' :'on (hd.id = hlg.hpms_id)'}
 *  ,{'table':'hpms.hpms_geom'
 *     ,'alias':'hg'
 *     ,'join' :'on (hg.id = hlg.geo_id)'}
 *  ]
 * @returns {Function} a function to handle queries
 */
exports.hpms_links = function hpms_links(options){
    var phost = 'localhost',
        pport = 5984,
        puser = '',
        ppass = ''
    if(options.host !== undefined) phost = options.host
    if(options.port !== undefined) pport = options.port
    if(options.auth !== undefined){
        if(options.auth.username !== undefined) puser = options.auth.username
        if(options.auth.password !== undefined) ppass = options.auth.password
    }
    var ss_opts = {}
    _.extend(ss_opts
            ,options
                          ,{'db':'spatialvds' // default database
                          ,'table':'hpms.hpms_data'
                          ,'alias':'hd'
                          ,'host':phost
                          ,'port':pport
                          ,'username':puser
                          ,'password':ppass
                          ,'select_properties':{'link_desc'           : 'linkname'
                                               ,'from_name'         :'from'
                                               ,'to_name'       : 'to'
                                               ,'locality'     : 'city'
                                               ,'year_record'       : 'year'
                                               ,'hd.id'   : 'hpms_id'
                                               ,'hg.id'    : 'geo_id'
                                               }
                          ,'id_col':['hpms_id']
                          ,'geo_col':'hg.geom'
                          ,'join_tables':[{'table':'hpms.hpms_link_geom'
                                          ,'alias':'hlg'
                                          ,'join' :'on (hd.id = hlg.hpms_id)'}
                                         ,{'table':'hpms.hpms_geom'
                                          ,'alias':'hg'
                                          ,'join' :'on (hg.id = hlg.geo_id)'}
                                         ]
                            }
                           )
    var hpms_link_handler = shape_service(ss_opts)
    return hpms_link_handler
}
