# frozen_string_literal: true

require 'test_plugin_helper'

module ForemanLeapp
  class PreupgradeJobTest < ActiveSupport::TestCase
    include Dynflow::Testing

    let(:host) { FactoryBot.create(:host) }
    let(:job_template) do
      FactoryBot.create(:job_template, template: 'echo "1"', job_category: 'leapp',
                                       provider_type: 'SSH', name: 'Leapp preupgrade')
    end
    let(:job_invocation) { FactoryBot.create(:job_invocation, job_category: ::ForemanLeapp::JOB_CATEGORY) }
    let(:template_invocation) do
      FactoryBot.create(:template_invocation, template: job_template, job_invocation: job_invocation)
    end

    let(:action) { create_action(Actions::ForemanLeapp::PreupgradeJob) }
    let(:planned_action) { plan_action(action, job_invocation, host, template_invocation) }

    setup do
      RemoteExecutionFeature.find_by(label: 'leapp_preupgrade').update(job_template: job_template)
    end

    describe 'plan' do
      test 'run plan phase' do
        assert_equal planned_action.input['host_id'], host.id
        assert_equal planned_action.input['job_invocation_id'], job_invocation.id
      end
    end

    describe '#format_output' do
      let(:output) { "first_line\n===leap_upgrade_report_start===\n{\n\"report\": \"yes!\"\n}\nExit status: 0\n" }

      it { assert action.send(:format_output, output), '{"report": "yes!"}' }
    end

    describe 'finalize' do
      it { assert_finalize_phase planned_action }
    end
  end
end
