# frozen_string_literal: true

require 'rake/testtask'

# Tasks
namespace :foreman_leapp do
  namespace :example do
    desc 'Example Task'
    task task: :environment do
      # Task goes here
    end
  end
end

# Tests
namespace :test do
  desc 'Test ForemanLeapp'
  Rake::TestTask.new(:foreman_leapp) do |t|
    test_dir = File.join(File.dirname(__FILE__), '../..', 'test')
    t.libs << ['test', test_dir]
    t.pattern = "#{test_dir}/**/*_test.rb"
    t.verbose = true
    t.warning = false
  end
end

namespace :foreman_leapp do
  task :rubocop do
    begin
      require 'rubocop/rake_task'
      RuboCop::RakeTask.new(:rubocop_foreman_leapp) do |task|
        task.patterns = ["#{ForemanLeapp::Engine.root}/app/**/*.rb",
                         "#{ForemanLeapp::Engine.root}/lib/**/*.rb",
                         "#{ForemanLeapp::Engine.root}/test/**/*.rb"]
      end
    rescue StandardError
      puts 'Rubocop not loaded.'
    end

    Rake::Task['rubocop_foreman_leapp'].invoke
  end
end

Rake::Task[:test].enhance ['test:foreman_leapp']

load 'tasks/jenkins.rake'
if Rake::Task.task_defined?(:'jenkins:unit')
  Rake::Task['jenkins:unit'].enhance ['test:foreman_leapp', 'foreman_leapp:rubocop']
end
