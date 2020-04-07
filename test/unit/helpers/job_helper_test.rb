# frozen_string_literal: true

require 'test_plugin_helper'

module Helpers
  class JobHelperTest < ActionView::TestCase
    let(:helper) { ::Helpers::JobHelper }
    # let(:host) { FactoryBot.create(:host) }
    let(:job_template) do
      FactoryBot.create(:job_template, template: 'echo "1"', job_category: 'leapp',
                                       provider_type: 'SSH', name: 'Leapp preupgrade')
    end
    let(:job_invocation) { FactoryBot.create(:job_invocation, job_category: ::ForemanLeapp::JOB_CATEGORY) }

    describe 'correct_feature?' do
      setup do
        RemoteExecutionFeature.find_by(label: 'leapp_preupgrade').update(job_template: job_template)
        FactoryBot.create(:template_invocation, template: job_template, job_invocation: job_invocation)
      end

      it 'correct category & feature' do
        assert helper.correct_feature?(job_invocation, 'leapp_preupgrade')
      end

      it 'wrong category' do
        job_invocation = FactoryBot.create(:job_invocation, job_category: 'NOPE')
        FactoryBot.create(:template_invocation, template: job_template, job_invocation: job_invocation)

        assert_not helper.correct_feature?(job_invocation, 'leapp_preupgrade')
      end

      it 'wrong feature' do
        assert_not helper.correct_feature?(job_invocation, 'leapp_preupgrade2')
      end
    end
  end
end
