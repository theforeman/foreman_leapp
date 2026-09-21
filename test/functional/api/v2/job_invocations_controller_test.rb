# frozen_string_literal: true

require 'test_plugin_helper'

module Api
  module V2
    class JobInvocationsControllerTest < ActionController::TestCase
      tests Api::V2::JobInvocationsController

      setup do
        @template = FactoryBot.create(
          :job_template,
          template: 'echo 1',
          job_category: 'Leapp',
          provider_type: 'SSH',
          name: 'Leapp remediation demo'
        )
        RemoteExecutionFeature.find_by(label: 'leapp_remediation_plan')
                              .update(job_template: @template)

        @invocation = FactoryBot.create(:job_invocation, :with_template, :with_task)
        @invocation.pattern_template_invocations.first.update!(template: @template)
        @invocation.update!(job_category: @template.job_category)

        @user = FactoryBot.create(:user, admin: false)
        setup_user('view', 'job_invocations', nil, @user)
      end

      test 'show includes has_leapp_report from JobHelper' do
        get :show, params: { id: @invocation.id, include_hosts: false },
                   session: set_session_user(@user)

        assert_response :success
        body = JSON.parse(@response.body)
        assert body['has_leapp_report']
      end
    end
  end
end
