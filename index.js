#!/usr/bin/env node

'use strict';
var inquirer = require('inquirer');
var request = require('request');

var loginDetails = [
    {
        type: 'input',
        name: 'connUrl',
        message: 'z/OS MF URL',
    },
    {
        type: 'input',
        name: 'user',
        message: 'User ID'
    },
    {
        type: 'password',
        name: 'password',
        message: 'Password'
    }
];

inquirer.prompt(loginDetails).then(function(answers){
    var connUrl = answers.connUrl;
    var options = {
        uri: answers.connUrl + '/zosmf/restjobs/jobs',
        auth: {
            user: answers.user,
            password: answers.password,
            sendImmediately: true
        },
        json: true,
        strictSSL: false
    };
    request.get(options, function(error, response, data){
        var jobs = {};
        
        data.forEach(function(job){
            jobs[job.jobname] = job;
        });
        var joblist = [
            {
                type: 'list',
                name: 'jobname',
                message: 'Which Job?',
                choices: Object.keys(jobs)
            }
        ];
        inquirer.prompt(joblist).then(function(answers){
            console.log("Get details for JOBID " + answers.jobname);
            options.uri = jobs[answers.jobname].url;
            request.get(options, function(error, response, data){
                options.uri = data['files-url'];
                request.get(options, function(error, response, data){
                    var ddCards = {};
                    data.forEach(function(dd){
                        ddCards[dd.ddname] = dd;
                    });
                    var ddlist = [
                        {
                            type: 'list',
                            name: 'ddcard',
                            message: 'Which DD card?',
                            choices: Object.keys(ddCards)
                        }
                    ];
                    inquirer.prompt(ddlist).then(function(answers){
                        options.uri = ddCards[answers.ddcard]['records-url'];
                        options.json = false;
                        request.get(options, function(error, response, data){
                            console.log(data);
                        });
                    });
                });
            });
        });
    });
});