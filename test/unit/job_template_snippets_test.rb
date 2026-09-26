# frozen_string_literal: true

require 'test_plugin_helper'
require 'erb'
require 'yaml'

module ForemanLeapp
  class JobTemplateSnippetsTest < ActiveSupport::TestCase
    class Renderer
      attr_reader :template_name

      def initialize(template_name, snippets = {})
        @template_name = template_name
        @snippets = snippets
      end

      def render_binding
        binding
      end

      def input(name)
        { 'Channel' => 'ga', 'Reboot' => 'true', 'Target Version' => '' }.fetch(name)
      end

      def shell_escape(value)
        value
      end

      def render_template(_name)
        "check-leapp\n"
      end

      def snippet_if_exists(name)
        @snippets[name]
      end

      def indent(count)
        prefix = ' ' * count
        yield.to_s.each_line.map { |line| prefix + line }.join
      end
    end

    test 'renders preupgrade snippets around the Leapp command' do
      rendered = render_template('leapp_preupgrade', 'Run preupgrade via Leapp',
        'Run preupgrade via Leapp custom pre' => "echo custom-pre\n",
        'Run preupgrade via Leapp custom post' => "echo custom-post\n")

      assert_before rendered, 'echo custom-pre', 'leapp preupgrade'
      assert_before rendered, 'leapp preupgrade', 'echo custom-post'
    end

    test 'renders upgrade snippets as Ansible tasks around the Leapp task' do
      rendered = render_template('leapp_upgrade', 'Run upgrade via Leapp',
        'Run upgrade via Leapp custom pre' => "- name: Custom pre\n  command: echo pre\n",
        'Run upgrade via Leapp custom post' => "- name: Custom post\n  command: echo post\n")
      tasks = YAML.safe_load(rendered).first.fetch('tasks')

      assert_equal ['Custom pre', 'Run Leapp Upgrade', 'Custom post', 'Reboot the machine'], tasks.pluck('name')
    end

    test 'keeps missing snippets optional' do
      rendered = render_template('leapp_upgrade', 'Run upgrade via Leapp')
      tasks = YAML.safe_load(rendered).first.fetch('tasks')

      assert_equal ['Run Leapp Upgrade', 'Reboot the machine'], tasks.pluck('name')
    end

    private

    def render_template(file_name, template_name, snippets = {})
      path = ForemanLeapp::Engine.root.join('app', 'views', 'foreman_leapp', 'job_templates', "#{file_name}.erb")
      renderer = Renderer.new(template_name, snippets)
      ERB.new(File.read(path), trim_mode: '-').result(renderer.render_binding)
    end

    def assert_before(text, first, second)
      assert_operator text.index(first), :<, text.index(second)
    end
  end
end
