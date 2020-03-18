# frozen_string_literal: true

require File.expand_path('lib/foreman_leapp/version', __dir__)

Gem::Specification.new do |s|
  s.name        = 'foreman_leapp'
  s.version     = ForemanLeapp::VERSION
  s.license     = 'GPL-3.0'
  s.authors     = ['Inessa Vasilevskaya']
  s.email       = ['ivasilev@redhat.com']
  s.homepage    = 'https://github.com/fernflower/foreman_leapp'
  s.summary     = 'A foreman plugin to support inplace rhel7->rhel8 upgrades with leapp utility'
  # also update locale/gemspec.rb
  s.description = 'A foreman plugin to support inplace rhel7->rhel8 upgrades with leapp utility'

  s.files = Dir['{app,config,db,lib,locale}/**/*'] + ['LICENSE', 'Rakefile', 'README.md']
  s.test_files = Dir['test/**/*']

  s.add_development_dependency 'rdoc'
  s.add_development_dependency 'rubocop'
  s.add_development_dependency 'foreman_remote_execution'
end
