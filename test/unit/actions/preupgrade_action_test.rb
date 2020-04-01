# frozen_string_literal: true

require 'test_plugin_helper'

module ForemanLeapp
  class PreupgradeActionTest < ActiveSupport::TestCase
    include Dynflow::Testing

    let(:rex_feature) { RemoteExecutionFeature.find_by(label: 'leapp_preupgrade') }
    let(:klass) { Actions::ForemanLeapp::PreUpgradeAction }

    describe 'plan' do
      test 'run plan phase' do
        job_invocation = FactoryBot.create(:job_invocation, :with_task, :with_template,
                                           job_category: ::ForemanLeapp::JOB_CATEGORY,
                                           remote_execution_feature: rex_feature)
        template_invocation = job_invocation.template_invocations.first
        host = template_invocation.host
        planned_action = create_and_plan_action(klass, job_invocation, host, template_invocation)

        assert_equal planned_action.input['host_id'], host.id
        assert_equal planned_action.input['job_invocation_id'], job_invocation.id
      end
    end

    describe '#correct_category?' do
      let(:action) { create_action(klass) }

      it 'correct category & feature' do
        assert action.send(:correct_job?, FactoryBot.build(:job_invocation,
                                                           job_category: ::ForemanLeapp::JOB_CATEGORY,
                                                           remote_execution_feature: rex_feature))
      end

      it 'wrong category' do
        assert_not action.send(:correct_job?, FactoryBot.build(:job_invocation,
                                                               remote_execution_feature: rex_feature))
      end

      it 'wrong feature' do
        assert_not action.send(:correct_job?, FactoryBot.build(:job_invocation,
                                                               job_category: ::ForemanLeapp::JOB_CATEGORY))
      end
    end

    describe '#format_output' do
      let(:action) { create_action(klass) }

      it 'run format_output' do
        assert action.send(:format_output, sample_output), '{"report": "yes!"}'
      end
    end

    private

    def sample_output
      "first_line\n===leap_upgrade_report_start===\n{\n\"report\": \"yes!\"\n}\nExit status: 0\n"
    end
  end
end
