var request = require('request');

module.exports = class ZosJobs {

  constructor(connUrl, userId, password) {
    this.url = connUrl;
    this.userId = userId;
    this.password = password;
  }

  getJobs() {
    return new Promise((resolve, reject) => {
      var options = {
        uri: this.url + '/zosmf/restjobs/jobs',
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
      var options = {
        uri: job.url,
        auth: {
          user: this.userId,
          password: this.password,
          sendImmediately: true
        },
        json: true,
        strictSSL: false
      };
      request.get(options, function (error, response, data) {
        options.uri = data['files-url'];
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