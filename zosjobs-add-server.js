#!/usr/bin/env node

console.log('add-server command');

const inquirer = require('inquirer');
const program = require('commander');
const async = require('async');
const Configstore = require('configstore');
const pkg = require('./package.json');

// create a Configstore instance with an unique ID e.g. 
// Package name and optionally some default values 
const conf = new Configstore(pkg.name);

program.parse(process.argv);

let name;
let connUrl;
let userName;
let pass;

async.series([
  function namePrompt(done) {
    inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: 'Server Name',
    }]).then((answers) => {
      name = answers.name;
      done();
    });
  },
  function connUrlPrompt(done) {
    inquirer.prompt([{
      type: 'input',
      name: 'connUrl',
      message: 'z/OS MF URL',
    }]).then((answers) => {
      connUrl = answers.connUrl;
      done();
    });
  },
  function userPrompt(done) {
    inquirer.prompt([{
      type: 'input',
      name: 'user',
      message: 'User ID',
    }]).then((answers) => {
      userName = answers.user;
      done();
    });
  },
  function passwordPrompt(done) {
    inquirer.prompt([{
      type: 'password',
      name: 'password',
      message: 'Password',
    }]).then((answers) => {
      pass = answers.password;
      done();
    });
  },
], () => {
  conf.set(name, {
    url: connUrl,
    user: userName,
    password: new Buffer(pass).toString('base64'),
  });
});
