#!/usr/bin/env node

const inquirer = require('inquirer');
const program = require('commander');
const async = require('async');

const ZosJobs = require('./zosjobs.js');
const Configstore = require('configstore');
const packageInfo = require('./package.json');

// create a Configstore instance with an unique ID e.g. 
// Package name and optionally some default values 
const conf = new Configstore(packageInfo.name);

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
  const serverDetails = conf.get(serverName);
  const zosjobs = new ZosJobs(serverDetails.url, serverDetails.user, serverDetails.password);
  inquirer.prompt([{
    type: 'editor',
    name: 'jcl',
    message: 'Enter JCL:',
  }]).then((answers) => {
    zosjobs.submitJob(answers.jcl).then(console.log).catch(console.log);
  });
});
