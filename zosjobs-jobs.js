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
let owner;

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
  console.log(serverDetails);
  const zosjobs = new ZosJobs(serverDetails.url, serverDetails.user, serverDetails.password);
  async.series([
    function getOwner(done) {
      if (program.owner) {
        owner = program.owner;
        done();
      } else {
        inquirer.prompt([{
          type: 'input',
          name: 'owner',
          message: 'Owner',
          default: serverDetails.user,
        }]).then((answers) => {
          owner = answers.owner;
          done();
        });
      }
    },
    function getJobs(done) {
      zosjobs.getJobs(owner).then((jobs) => {
        if (Object.keys(jobs).length > 0) {
          const joblist = [{
            type: 'list',
            name: 'jobname',
            message: 'Which Job?',
            choices: Object.keys(jobs),
          }];
          inquirer.prompt(joblist).then((answers) => {
            zosjobs.getJobCards(jobs[answers.jobname]).then((ddCards) => {
              if (Object.keys(ddCards).length > 0) {
                const ddlist = [{
                  type: 'list',
                  name: 'ddcard',
                  message: 'Which DD card?',
                  choices: Object.keys(ddCards),
                }];
                inquirer.prompt(ddlist).then((ddanswers) => {
                  zosjobs.getRecords(ddCards[ddanswers.ddcard])
                    .then(data => console.log(data)).catch(error => console.log(error));
                });
              } else {
                console.log('No DD Cards for Job');
              }
            }).catch(error => console.log(error));
          });
        } else {
          console.log('No Jobs Found');
        }
      }).catch(error => console.log(error));
      done();
    },
  ]);
});
