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

const request = require('request');
const URL = require('url');

module.exports = class ZosJobs {
  constructor(connUrl, userId, password) {
    this.url = connUrl;
    this.userId = userId;
    this.password = password;
  }

  getJobs(jobOwner) {
    return new Promise((resolve, reject) => {
      const options = {
        uri: `${this.url}/zosmf/restjobs/jobs`,
        qs: {
          owner: jobOwner,
        },
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true,
        },
        json: true,
        strictSSL: false,
      };
      request.get(options, (error, response, data) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          if (data === undefined) {
            reject(response.statusMessage);
          } else {
            reject(data);
          }
        } else {
          const jobs = {};

          data.forEach((job) => {
            jobs[job.jobname] = job;
          });
          resolve(jobs);
        }
      });
    });
  }

  getJobCards(job) {
    return new Promise((resolve, reject) => {
      const filesUrl = URL.parse(job['files-url']);
      const options = {
        url: filesUrl,
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true,
        },
        json: true,
        strictSSL: false,
      };
      request.get(options, (error, response, data) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          if (data === undefined) {
            reject(response.statusMessage);
          } else {
            reject(data);
          }
        } else {
          const ddCards = {};
          data.forEach((dd) => {
            ddCards[dd.ddname] = dd;
          });
          resolve(ddCards);
        }
      });
    });
  }

  getRecords(ddCard) {
    return new Promise((resolve, reject) => {
      const options = {
        uri: ddCard['records-url'],
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true,
        },
        json: false,
        strictSSL: false,
      };
      request.get(options, (error, response, data) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          if (data === '') {
            reject(response.statusMessage);
          } else {
            reject(data);
          }
        } else {
          resolve(data);
        }
      });
    });
  }

  issueCommand(command, systemName) {
    return new Promise((resolve, reject) => {
      const options = {
        uri: `${this.url}/zosmf/restconsoles/consoles/defcn`,
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true,
        },
        json: true,
        strictSSL: false,
        body: {
          cmd: command,
          system: systemName,
        },
      };
      request.put(options, (error, response, data) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          if (data === undefined) {
            reject(response.statusCode);
          } else {
            reject(data);
          }
        } else {
          resolve(data['cmd-response'].replace(/\r/g, '\n'));
        }
      });
    });
  }

  submitJob(jcl) {
    return new Promise((resolve, reject) => {
      const options = {
        uri: `${this.url}/zosmf/restjobs/jobs/`,
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true,
        },
        headers: {
          'Content-Type': 'text/plain',
          'X-IBM-Intrdr-Mode': 'TEXT',
        },
        json: false,
        strictSSL: false,
        body: jcl,
      };
      request.put(options, (error, response, data) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          if (data === '') {
            reject(response.statusCode);
          } else {
            reject(data);
          }
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  submitRemoteJob(location) {
    return new Promise((resolve, reject) => {
      const options = {
        uri: `${this.url}/zosmf/restjobs/jobs/`,
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true,
        },
        headers: {
          'X-IBM-Intrdr-Class': 'A',
        },
        json: true,
        strictSSL: false,
        body: {
          file: location,
        },
      };
      request.put(options, (error, response, data) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          if (data === '') {
            reject(response.statusCode);
          } else {
            reject(data);
          }
        } else {
          resolve(data);
        }
      });
    });
  }
};
