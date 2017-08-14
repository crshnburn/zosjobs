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

const program = require('commander');

const packageInfo = require('./package.json');

program.version(packageInfo.version)
  .command('add-server', 'Add a z/OS MF Server configuration')
  .alias('add')
  .command('update-server', 'Update a z/OS MF Server configuration')
  .alias('update')
  .command('delete-server', 'Remove a z/OS MF Server configuration')
  .alias('delete')
  .command('jobs', 'Get information about a z/OS Job')
  .command('submit', 'Submit a Job')
  .command('command', 'Issue a command')
  .parse(process.argv);
