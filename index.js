#!/usr/bin/env node

'use strict';
var inquirer = require('inquirer');
var request = require('request');
var program = require('commander');
var async = require('async');

var ZosJobs = require('./zosjobs.js');

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
            user = program.user;
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
            password = program.password;
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
    let zosjobs = new ZosJobs(connUrl, user, password);
    zosjobs.getJobs().then(jobs => {
        var joblist = [{
            type: 'list',
            name: 'jobname',
            message: 'Which Job?',
            choices: Object.keys(jobs)
        }];
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
        inquirer.prompt(joblist).then(answers => {
            zosjobs.getJobCards(jobs[answers.jobname]).then(ddCards => {
                var ddlist = [{
                    type: 'list',
                    name: 'ddcard',
                    message: 'Which DD card?',
                    choices: Object.keys(ddCards)
                }];
                inquirer.prompt(ddlist).then(answers => {
                    zosjobs.getRecords(ddCards[answers.ddcard]).then(data => console.log(data)).catch(error => console.log(error));
                });
            }).catch(error => console.log(error));
        });
    }).catch(error => console.log(error));
});