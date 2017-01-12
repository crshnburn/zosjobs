const request = require('request');
const URL = require('url');

module.exports = class ZosJobs {

  constructor(connUrl, userId, password, owner) {
    this.url = connUrl;
    this.userId = userId;
    this.password = password;
    this.owner = owner;
  }

  getJobs() {
    return new Promise((resolve, reject) => {
      var options = {
        uri: this.url + '/zosmf/restjobs/jobs/',
        qs: {
          owner: this.owner
        },
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true
        },
        json: true,
        strictSSL: false
      };
      request.get(options, function (error, response, data) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          if (data === undefined) {
            reject(response.statusMessage);
          } else {
            reject(data);
          }
        } else {
          var jobs = {};

          data.forEach(function (job) {
            jobs[job.jobname] = job;
          });
          resolve(jobs);
        }
      });
    });
  }

  getJobCards(job) {
    return new Promise((resolve, reject) => {
      var filesUrl = URL.parse(job['files-url']);
      filesUrl.path = filesUrl.path.replace('\/\/', '\/');
      var options = {
        url: filesUrl,
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true
        },
        json: true,
        strictSSL: false
      };
      request.get(options, function (error, response, data) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          if (data === undefined) {
            reject(response.statusMessage);
          } else {
            reject(data);
          }
        } else {
          var ddCards = {};
          data.forEach(function (dd) {
            ddCards[dd.ddname] = dd;
          });
          resolve(ddCards);
        }
      });
    });
  }

  getRecords(ddCard) {
    return new Promise((resolve, reject) => {
      var options = {
        uri: ddCard['records-url'],
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true
        },
        json: false,
        strictSSL: false
      };
      request.get(options, function (error, response, data) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          if (data === undefined) {
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
};