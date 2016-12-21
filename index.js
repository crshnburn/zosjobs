#!/usr/bin/env node

'use strict';
var inquirer = require('inquirer');
var request = require('request');
var program = require('commander');
var async = require('async');

program.version('0.1.0')
    .option('-c, --connUrl [url]', 'specifies the z/OS MF hostname and port')
    .option('-u, --user [user]', 'specifies the user ID')
    .option('-p, --password [password]', 'specifies the password')
    .parse(process.argv);

var connUrl;
var user;
var password;

async.series([
    function (done) {
        if (program.connUrl) {
            connUrl = program.connUrl;
            done();
        } else {
            inquirer.prompt([{
                type: 'input',
                name: 'connUrl',
                message: 'z/OS MF URL',
            }]).then(function (answers) {
                connUrl = answers.connUrl;
                done();
            });
        }
    },
    function (done) {
        if (program.user) {
            connUrl = program.user;
            done();
        } else {
            inquirer.prompt([{
                type: 'input',
                name: 'user',
                message: 'User ID',
            }]).then(function (answers) {
                user = answers.user;
                done();
            });
        }
    },
    function (done) {
        if (program.password) {
            connUrl = program.password;
            done();
        } else {
            inquirer.prompt([{
                type: 'password',
                name: 'password',
                message: 'Password',
            }]).then(function (answers) {
                password = answers.password;
                done();
            });
        }
    }
], function (err) {
    console.log(connUrl);

    var options = {
        uri: connUrl + '/zosmf/restjobs/jobs',
        auth: {
            user: user,
            password: password,
            sendImmediately: true
        },
        json: true,
        strictSSL: false
    };
    request.get(options, function (error, response, data) {
        if (error) {
            console.log(error);
            process.exit(1);
        } else if (response.statusCode != 200) {
            if (data === undefined) {
                console.log(response.statusMessage);
            } else {
                console.log(data);
            }
        } else {
            var jobs = {};

            data.forEach(function (job) {
                jobs[job.jobname] = job;
            });
            var joblist = [{
                type: 'list',
                name: 'jobname',
                message: 'Which Job?',
                choices: Object.keys(jobs)
            }];
            inquirer.prompt(joblist).then(function (answers) {
                console.log("Get details for JOBID " + answers.jobname);
                options.uri = jobs[answers.jobname].url;
                request.get(options, function (error, response, data) {
                    options.uri = data['files-url'];
                    request.get(options, function (error, response, data) {
                        if (error) {
                            console.log(error);
                            process.exit(1);
                        } else if (response.statusCode != 200) {
                            if (data === undefined) {
                                console.log(response.statusMessage);
                            } else {
                                console.log(data);
                            }
                            process.exit(1);
                        } else {
                            var ddCards = {};
                            data.forEach(function (dd) {
                                ddCards[dd.ddname] = dd;
                            });
                            var ddlist = [{
                                type: 'list',
                                name: 'ddcard',
                                message: 'Which DD card?',
                                choices: Object.keys(ddCards)
                            }];
                            inquirer.prompt(ddlist).then(function (answers) {
                                options.uri = ddCards[answers.ddcard]['records-url'];
                                options.json = false;
                                request.get(options, function (error, response, data) {
                                    if (error) {
                                        console.log(error);
                                        process.exit(1);
                                    } else if (response.statusCode != 200) {
                                        if (data === undefined) {
                                            console.log(response.statusMessage);
                                        } else {
                                            console.log(data);
                                        }
                                        process.exit(1);
                                    } else {
                                        console.log(data);
                                    }
                                });
                            });
                        }
                    });
                });
            });
        }
    });
});