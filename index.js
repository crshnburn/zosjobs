#!/usr/bin/env node

/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* istanbul ignore next */

const inquirer = require('inquirer');
const program = require('commander');
const async = require('async');

const ZosJobs = require('./zosjobs.js');

program.version('0.1.0')
  .option('-c, --connUrl [url]', 'specifies the z/OS MF hostname and port')
  .option('-u, --user [user]', 'specifies the user ID')
  .option('-p, --password [password]', 'specifies the password')
  .option('-o, --owner [owner]', 'the owner of the jobs to retrieve')
  .parse(process.argv);

let connUrl;
let user;
let password;
let owner;

async.series([
  function connUrlPrompt(done) {
    if (program.connUrl) {
      connUrl = program.connUrl;
      done();
    } else {
      inquirer.prompt([{
        type: 'input',
        name: 'connUrl',
        message: 'z/OS MF URL',
      }]).then((answers) => {
        connUrl = answers.connUrl;
        done();
      });
    }
  },
  function userPrompt(done) {
    if (program.user) {
      user = program.user;
      done();
    } else {
      inquirer.prompt([{
        type: 'input',
        name: 'user',
        message: 'User ID',
      }]).then((answers) => {
        user = answers.user;
        done();
      });
    }
  },
  function passwordPrompt(done) {
    if (program.password) {
      password = program.password;
      done();
    } else {
      inquirer.prompt([{
        type: 'password',
        name: 'password',
        message: 'Password',
      }]).then((answers) => {
        password = answers.password;
        done();
      });
    }
  },
  function ownerPrompt(done) {
    if (program.owner) {
      owner = program.owner;
      done();
    } else {
      inquirer.prompt([{
        type: 'input',
        name: 'owner',
        message: 'Owner',
        default: user,
      }]).then((answers) => {
        owner = answers.owner;
        done();
      });
    }
  },
], () => {
  const zosjobs = new ZosJobs(connUrl, user, password, owner);
  zosjobs.getJobs().then((jobs) => {
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
});
