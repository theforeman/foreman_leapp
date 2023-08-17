# ForemanLeapp

This plugin allows to run inplace upgrades for RHEL hosts in Foreman using Leapp tool.
For more information about Leapp tool check [github](https://github.com/oamg/leapp) or [developer docs](https://leapp.readthedocs.io/en/latest/).

## Installation

See [Plugins Manual](https://www.theforeman.org/plugins/#2.Installation) for how to install Foreman plugins.

## Usage

The plugin will add following jobs:
- Run preupgrade via Leapp
- Remediation plan
- Run upgrade via Leapp

### Channel

Leapp by default will use the same "channel" (e4s, eus, aus) as the current OS, so if you are using "eus" repositories, the target OS will be on "eus" repositories as well.
But if you are upgrading and want to target a different channel, i.e. from a RHEL 7.9 to a RHEL 8.6 EUS, you can do it by explicitely setting the channel to "eus".

The channel have to be specified in both the preupgrade and upgrade jobs.
Default value of "channel" is "ga" - General availability: regular repositories are used by default.

## Api
- `GET /api/preupgrade_reports` List Preupgrade reports
- `GET /api/preupgrade_reports/:id` Show Preupgrade report
- `GET /api/job_invocations/:id/preupgrade_reports` List Preupgrade reports for Job invocation

## Contributing

Fork and send a Pull Request. Thanks!

## Copyright

Copyright (c) 2019 Inessa Vasilevskaya

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
