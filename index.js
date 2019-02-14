const express = require('express')
const fs = require('fs')
const http = require('http')
const https = require('https')
const mongodb = require('mongodb')
const bodyParser = require('body-parser');

const app = express()
const port = 4000
const SSLport = 4001
const mongourl = "mongodb://localhost:27017/";

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/diunar.jl-lagrange.com.cn/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/diunar.jl-lagrange.com.cn/fullchain.pem'),
    requestCert: false,
    rejectUnauthorized: false
}

http.createServer(app).listen(port, () => console.log(`HTTP server is listening on port ${port}`))
https.createServer(options, app).listen(SSLport, () => console.log(`HTTPS server is listening on port ${SSLport}`))

app.use(bodyParser.urlencoded({
    extended:true
}));

app.post('/overview', function(req, res) {
    var params = req.body
    mongodb.MongoClient.connect(mongourl, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err
        var dbo = db.db("parking")
        dbo.collection("overview").find({}).toArray(function(err, result) {
            if (err) throw err
            result = result[0]
            delete result._id
            if ("total" in params) {
                res.send(result.total.toString())
            } else if ("idle" in params) {
                res.send(result.idle.toString())
            } else if ("occupied" in params) {
                res.send(result.occupied.toString())
            } else {
                res.send(result)
            }
            db.close()
        })
    })
})

app.post('/detail', function(req, res) {
    var params = req.body
    mongodb.MongoClient.connect(mongourl, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err
        var dbo = db.db("parking")
        dbo.collection("detail").find({}).toArray(function(err, result) {
            if (err) throw err
            if ("id" in params) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i].id == params.id) {
                        res.send(result[i].state.toString())
                    }
                }
            } else {
                for (var i = 0; i < result.length; i++) {
                    delete result[i]._id
                }
                res.send(result)
            }
            db.close()
        })
    })
})

app.post('/switch', function(req, res) {
    var id = parseInt(req.body.id)
    mongodb.MongoClient.connect(mongourl, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err
        var dbo = db.db("parking")
        var whereStr = {"id": id}
        dbo.collection("detail").find(whereStr).toArray(function(err, result) {
            if (err) throw err;
            if (result[0].state == 0) {
                var updateStr = {$set: {"state": 1}}
            } else {
                var updateStr = {$set: {"state": 0}}
            }
            dbo.collection("detail").updateOne(whereStr, updateStr, function(err, res) {
                if (err) throw err
                updateOverview()
                db.close()
            })
        })
    })
    res.send()
})

function updateOverview() {
    mongodb.MongoClient.connect(mongourl, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err
        var dbo = db.db("parking")
        dbo.collection("detail").find({}).toArray(function(err, result) {
            if (err) throw err
            var total = 0, idle = 0, occupied = 0
            for (var i = 0; i < result.length; i++) {
                if (result[i].state == 0) {
                    idle++
                } else {
                    occupied++
                }
                total++
            }
            var updateStr = {$set: {"total": total, "idle": idle, "occupied": occupied}}
            dbo.collection("overview").updateOne({}, updateStr, function(err, res) {
                if (err) throw err
                db.close()
            })
        })
    })
}