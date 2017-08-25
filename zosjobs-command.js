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
  .option('-s --server <servername>')
  .option('-m --mvsCommand <command>')
  .option('-i --image <MVS Image>')
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
  const zosjobs = new ZosJobs(serverDetails.url, serverDetails.user, new Buffer(serverDetails.password, 'base64').toString());
  let command;
  let image;
  async.series([
    function commandPrompt(done) {
      if (program.mvsCommand) {
        command = program.mvsCommand;
        done();
      } else {
        inquirer.prompt([{
          type: 'input',
          name: 'command',
          message: 'Enter the command',
        }]).then((answers) => {
          command = answers.command;
          done();
        });
      }
    },
    function imagePrompt(done) {
      if (program.image) {
        image = program.image;
        done();
      } else {
        inquirer.prompt([{
          type: 'input',
          name: 'system',
          message: 'Which system should the command run on?',
        }]).then((answers) => {
          image = answers.image;
          done();
        });
      }
    },
  ], () => {
    zosjobs.issueCommand(command, image).then(console.log).catch(console.log);
  });
});
