/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
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

require('assert');
var nock = require('nock');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

var ZosJobs = require('../zosjobs.js');

describe('zosjobs', function () {
  describe('getJobs', function () {
    it('should return a list of jobs', function () {
      var conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs/').query({
        owner: 'user',
      }).reply(200, [{
          class: 'TSU',
          'files-url': 'https://winmvs21:20049/zosmf/restjobs/jobs//-JES2/SMITHSO/TSU34306/files',
          jobid: 'TSU34306',
          jobname: 'SMITHSO',
          owner: 'SMITHSO',
          retcode: null,
          status: 'ACTIVE',
          subsystem: 'JES2',
          type: 'TSU',
          url: 'https://winmvs21:20049/zosmf/restjobs/jobs//-JES2/SMITHSO/TSU34306',
        },
        {
          class: 'A',
          'files-url': 'https://winmvs21:20049/zosmf/restjobs/jobs//-JES2/TESTA/JOB34307/files',
          jobid: 'JOB34307',
          jobname: 'TESTA',
          owner: 'SMITHSO',
          retcode: null,
          status: 'ACTIVE',
          subsystem: 'JES2',
          type: 'JOB',
          url: 'https://winmvs21:20049/zosmf/restjobs/jobs//-JES2/TESTA/JOB34307',
        },
      ]);
      return conn.getJobs().should.eventually.have.keys('SMITHSO', 'TESTA');
    });
    it('should fail with a security error', function () {
      var conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs/').query({
        owner: 'user',
      }).reply(403);
      return conn.getJobs().should.be.rejectedWith(403);
    });
    it('should fail due to network error', function () {
      var conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs/').query({
        owner: 'user',
      }).replyWithError('Socket Error');
      return conn.getJobs().should.be.rejectedWith('Socket Error');
    });
  });
});
