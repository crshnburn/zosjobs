# zosjobs command

Command line tool to retrieve z/OS Job Output and display on the console.

Makes use of the [zOSMF REST API](https://www.ibm.com/support/knowledgecenter/SSLTBW_2.1.0/com.ibm.zos.v2r1.izua700/IZUHPINFO_API_RESTJOBS.htm).

![zosjobs example](doc/zosjobs.gif)

## Installation

1. `git clone https://github.ibm.com/SMITHSON/zosjobs.git`
1. `npm link`

## Usage

```
  Usage: zosjobs [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -c, --connUrl [url]        specifies the z/OS MF hostname and port
    -u, --user [user]          specifies the user ID
    -p, --password [password]  specifies the password
    -o, --owner [owner]        the owner of the jobs to retrieve
```

## License
```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```