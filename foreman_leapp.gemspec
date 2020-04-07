# frozen_string_literal: true

require 'date'
require File.expand_path('lib/foreman_leapp/version', __dir__)

Gem::Specification.new do |s|
  s.name        = 'foreman_leapp'
  s.version     = ForemanLeapp::VERSION
  s.license     = 'GPL-3.0'
  s.date        = Date.today.to_s
  s.authors     = ['Foreman Leapp team']
  s.email       = ['foreman-dev@googlegroups.com']
  s.homepage    = 'https://github.com/oamg/foreman_leapp'
  s.summary     = 'A Foreman plugin to support inplace RHEL 7 -> RHEL 8 upgrades with Leapp utility.'
  s.description = 'A Foreman plugin to support inplace RHEL 7 -> RHEL 8 upgrades with Leapp utility.'

  s.files = Dir['{app,config,db,lib,locale}/**/*'] + ['LICENSE', 'Rakefile', 'README.md']
  s.test_files = Dir['test/**/*']

  s.add_dependency 'foreman_remote_execution'
  s.add_development_dependency 'rdoc'
  s.add_development_dependency 'rubocop'
end
