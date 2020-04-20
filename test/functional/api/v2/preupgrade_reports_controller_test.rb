# frozen_string_literal: true

require 'test_plugin_helper'

module Api
  module V2
    class PreupgradeReportsControllerTest < ActionController::TestCase
      setup do
        @host = FactoryBot.create(:host)
        @job_invocation = FactoryBot.create(:job_invocation)
        @report = FactoryBot.create(:preupgrade_report, host: @host, job_invocation: @job_invocation)
        @entry = FactoryBot.create(:preupgrade_report_entry, host: @host, preupgrade_report: @report)
      end

      test 'should get index' do
        get :index, session: set_session_user
        assert_response :success
        assert_not_empty ActiveSupport::JSON.decode(@response.body)['results']
      end

      test 'should get detail of report and its entries' do
        get :show, params: { id: @job_invocation.id }
        assert_response :success

        response = ActiveSupport::JSON.decode(@response.body)
        assert_equal response['id'], @report.id
        assert_not_empty response['preupgrade_report_entries']
      end

      context 'permissions' do
        test 'should get index with :view_job_invocations' do
          setup_user 'view', 'job_invocations'
          get :index, session: set_session_user(:one)
          assert_response :success
        end

        test 'should not get index without :view_job_invocations' do
          setup_user 'view', 'hosts'
          get :index, session: set_session_user(:one)
          assert_response :forbidden
        end

        test 'should get show with :view_job_invocations' do
          setup_user 'view', 'job_invocations'
          get :show, params: { id: @job_invocation.id }, session: set_session_user(:one)
          assert_response :success
        end

        test 'should not get show without :view_job_invocations' do
          setup_user 'view', 'hosts'
          get :show, params: { id: @job_invocation.id }, session: set_session_user(:one)
          assert_response :forbidden
        end
      end
    end
  end
end
