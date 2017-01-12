#!/usr/bin/env node

'use strict';
var inquirer = require('inquirer');
var program = require('commander');
var async = require('async');

var ZosJobs = require('./zosjobs.js');

program.version('0.1.0')
    .option('-c, --connUrl [url]', 'specifies the z/OS MF hostname and port')
    .option('-u, --user [user]', 'specifies the user ID')
    .option('-p, --password [password]', 'specifies the password')
    .option('-o, --owner [owner]', 'the owner of the jobs to retrieve')
    .parse(process.argv);

var connUrl;
var user;
var password;
var owner;

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
            }]).then(answers => {
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
            }]).then(answers => {
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
            }]).then(answers => {
                password = answers.password;
                done();
            });
        }
    },
    function (done){
        if(program.owner) {
            owner = program.owner;
            done();
        } else {
            inquirer.prompt([{
                type: 'input',
                name: 'owner',
                message: 'Owner',
                default: user
            }]).then(answers => {
                owner = answers.owner;
                done();
            });
        }
    }
], function (err) {
    let zosjobs = new ZosJobs(connUrl, user, password, owner);
    zosjobs.getJobs().then(jobs => {
        if (Object.keys(jobs).length > 0) {
            var joblist = [{
                type: 'list',
                name: 'jobname',
                message: 'Which Job?',
                choices: Object.keys(jobs)
            }];
            inquirer.prompt(joblist).then(answers => {
                zosjobs.getJobCards(jobs[answers.jobname]).then(ddCards => {
                    if (Object.keys(ddCards).length > 0) {
                        var ddlist = [{
                            type: 'list',
                            name: 'ddcard',
                            message: 'Which DD card?',
                            choices: Object.keys(ddCards)
                        }];
                        inquirer.prompt(ddlist).then(answers => {
                            zosjobs.getRecords(ddCards[answers.ddcard]).then(data => console.log(data)).catch(error => console.log(error));
                        });
                    } else {
                        console.log("No DD Cards for Job");
                    }
                }).catch(error => console.log(error));
            });
        } else {
            console.log("No Jobs Found");
        }
    }).catch(error => console.log(error));
});