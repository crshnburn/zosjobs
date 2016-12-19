#!/usr/bin/env node

'use strict';
var inquirer = require('inquirer');

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
    console.log("\nLogin details:");
    console.log(JSON.stringify(answers, null, '   '));
});