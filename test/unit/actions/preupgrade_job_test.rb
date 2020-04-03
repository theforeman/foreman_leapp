# frozen_string_literal: true

require 'test_plugin_helper'

module ForemanLeapp
  class PreupgradeJobTest < ActiveSupport::TestCase
    include Dynflow::Testing

    let(:rex_feature) { RemoteExecutionFeature.find_by(label: 'leapp_preupgrade') }
    let(:job_invocation) do
      FactoryBot.create(:job_invocation, :with_task, :with_template,
                        job_category: ::ForemanLeapp::JOB_CATEGORY,
                        remote_execution_feature: rex_feature)
    end
    let(:template_invocation) { job_invocation.template_invocations.first }
    let(:host) { template_invocation.host }

    let(:action) { create_action(Actions::ForemanLeapp::PreupgradeJob) }
    let(:planned_action) { plan_action(action, job_invocation, host, template_invocation) }

    describe 'plan' do
      test 'run plan phase' do
        assert_equal planned_action.input['host_id'], host.id
        assert_equal planned_action.input['job_invocation_id'], job_invocation.id
      end
    end

    describe '#correct_category?' do
      it 'correct category & feature' do
        assert action.send(:leapp_preupgrade_job?, FactoryBot.build(:job_invocation,
                                                                    job_category: ::ForemanLeapp::JOB_CATEGORY,
                                                                    remote_execution_feature: rex_feature))
      end

      it 'wrong category' do
        assert_not action.send(:leapp_preupgrade_job?, FactoryBot.build(:job_invocation,
                                                                        remote_execution_feature: rex_feature))
      end

      it 'wrong feature' do
        assert_not action.send(:leapp_preupgrade_job?, FactoryBot.build(:job_invocation,
                                                                        job_category: ::ForemanLeapp::JOB_CATEGORY))
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
