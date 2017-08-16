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

program
  .option('-s --server [servername]')
  .parse(process.argv);

let serverName;
let currentConfig;
let connUrl;
let userName;
let pass;

async.series([
  function serverPrompt(done) {
    if (program.server) {
      serverName = program.server;
      done();
    } else {
      inquirer.prompt([{
        type: 'list',
        name: 'server',
        message: 'Server Name',
        choices: Object.keys(conf.all),
      }]).then((answers) => {
        serverName = answers.server;
        currentConfig = conf.get(serverName);
        done();
      });
    }
  },
  function connUrlPrompt(done) {
    inquirer.prompt([{
      type: 'input',
      name: 'connUrl',
      message: 'z/OS MF URL',
      default: currentConfig.url,
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
      default: currentConfig.user,
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
  conf.set(serverName, {
    url: connUrl,
    user: userName,
    password: new Buffer(pass).toString('base64'),
  });
});
