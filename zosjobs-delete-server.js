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
        done();
      });
    }
  },
], () => {
  conf.delete(serverName);
});
