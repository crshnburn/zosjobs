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

require('assert');
const nock = require('nock');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const getJobsResponse = [{
  class: 'TSU',
  'files-url': 'http://test:9080/zosmf/restjobs/jobs/-JES2/SMITHSO/TSU34306/files',
  jobid: 'TSU34306',
  jobname: 'SMITHSO',
  owner: 'SMITHSO',
  retcode: null,
  status: 'ACTIVE',
  subsystem: 'JES2',
  type: 'TSU',
  url: 'http://test:9080/zosmf/restjobs/jobs/-JES2/SMITHSO/TSU34306',
},
{
  class: 'A',
  'files-url': 'http://test:9080/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files',
  jobid: 'JOB34307',
  jobname: 'TESTA',
  owner: 'SMITHSO',
  retcode: null,
  status: 'ACTIVE',
  subsystem: 'JES2',
  type: 'JOB',
  url: 'http://test:9080/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307',
},
];

const filesResponse = [{
  'byte-count': 1403,
  class: 'X',
  ddname: 'JESMSGLG',
  id: 2,
  jobid: 'JOB34307',
  jobname: 'TESTA',
  procstep: null,
  'record-count': 23,
  'records-url': 'http://test:9080/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files/2/records',
  stepname: 'JES2',
  subsystem: 'JES2',
},
{
  'byte-count': 899,
  class: 'X',
  ddname: 'JESJCL',
  id: 3,
  jobid: 'JOB34307',
  jobname: 'TESTA',
  procstep: null,
  'record-count': 17,
  'records-url': 'http://test:9080/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files/3/records',
  stepname: 'JES2',
  subsystem: 'JES2',
},
{
  'byte-count': 2093,
  class: 'X',
  ddname: 'JESYSMSG',
  id: 4,
  jobid: 'JOB34307',
  jobname: 'TESTA',
  procstep: null,
  'record-count': 39,
  'records-url': 'http://test:9080/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files/4/records',
  stepname: 'JES2',
  subsystem: 'JES2',
},
{
  'byte-count': 5535,
  class: 'X',
  ddname: 'STDOUT',
  id: 102,
  jobid: 'JOB34307',
  jobname: 'TESTA',
  procstep: null,
  'record-count': 78,
  'records-url': 'http://test:9080/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files/102/records',
  stepname: 'CTG',
  subsystem: 'JES2',
},
{
  'byte-count': 595,
  class: 'X',
  ddname: 'STDERR',
  id: 103,
  jobid: 'JOB34307',
  jobname: 'TESTA',
  procstep: null,
  'record-count': 6,
  'records-url': 'http://test:9080/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files/103/records',
  stepname: 'CTG',
  subsystem: 'JES2',
},
];

const ZosJobs = require('../zosjobs.js');

describe('zosjobs', () => {
  describe('getJobs', () => {
    it('should return a list of jobs', () => {
      const conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs').query({
        owner: 'user',
      }).reply(200, getJobsResponse);
      return conn.getJobs().should.eventually.have.keys('SMITHSO', 'TESTA');
    });
    it('should fail with a security error', () => {
      const conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs').query({
        owner: 'user',
      }).reply(403);
      return conn.getJobs().should.be.rejectedWith(403);
    });
    it('should fail with a zOSMF error', () => {
      const conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs').query({
        owner: 'user',
      }).reply(500, 'Server Error');
      return conn.getJobs().should.be.rejectedWith('Server Error');
    });
    it('should fail due to network error', () => {
      const conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs').query({
        owner: 'user',
      }).replyWithError('Socket Error');
      return conn.getJobs().should.be.rejectedWith('Socket Error');
    });
  });

  describe('getJobCards', () => {
    it('should return the list of job cards', () => {
      const conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs').query({
        owner: 'user',
      }).reply(200, getJobsResponse);
      nock('http://test:9080').get('/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files').reply(200, filesResponse);
      conn.getJobs().then(jobs => conn.getJobCards(jobs.TESTA).should.eventually.have.keys('JESMSGLG', 'JESJCL', 'JESYSMSG', 'STDOUT', 'STDERR'));
    });
    it('should fail with an authorization error', () => {
      const conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs').query({
        owner: 'user',
      }).reply(200, getJobsResponse);
      nock('http://test:9080').get('/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files').reply(401);
      conn.getJobs().then(jobs => conn.getJobCards(jobs.TESTA).should.be.rejectedWith(401));
    });
    it('should fail with a zOSMF error', () => {
      const conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs').query({
        owner: 'user',
      }).reply(200, getJobsResponse);
      nock('http://test:9080').get('/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files').reply(500, 'Server Error');
      conn.getJobs().then(jobs => conn.getJobCards(jobs.TESTA).should.be.rejectedWith('Server Error'));
    });
    it('should fail due to a network error', () => {
      const conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
      nock('http://test:9080').get('/zosmf/restjobs/jobs').query({
        owner: 'user',
      }).reply(200, getJobsResponse);
      nock('http://test:9080').get('/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files').replyWithError('Socket Error');
      conn.getJobs().then(jobs => conn.getJobCards(jobs.TESTA).should.be.rejectedWith('Socket Error'));
    });
  });
  describe('getRecords', () => {
    const conn = new ZosJobs('http://test:9080', 'user', 'password', 'user');
    it('should return the record content', () => {
      nock('http://test:9080').get('/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files/102/records').reply(200, 'Output');
      return conn.getRecords(filesResponse[3]).should.eventually.equal('Output');
    });
    it('should return an unauthorized error', () => {
      nock('http://test:9080').get('/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files/102/records').reply(401);
      return conn.getRecords(filesResponse[3]).should.be.rejectedWith(401);
    });
    it('should return an zOSMF error', () => {
      nock('http://test:9080').get('/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files/102/records').reply(500, 'Server Error');
      return conn.getRecords(filesResponse[3]).should.be.rejectedWith('Server Error');
    });
    it('should return a socket error', () => {
      nock('http://test:9080').get('/zosmf/restjobs/jobs/-JES2/TESTA/JOB34307/files/102/records').replyWithError('Socket Error');
      return conn.getRecords(filesResponse[3]).should.be.rejectedWith('Socket Error');
    });
  });
});
