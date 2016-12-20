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
        console.log(JSON.stringify(data, null, 3));
    });
});