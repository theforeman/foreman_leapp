# frozen_string_literal: true

require 'test_plugin_helper'

module Api
  module V2
    class PreupgradeReportsControllerTest < ActionController::TestCase
      setup do
        @host = FactoryBot.create(:host)
        @report = FactoryBot.create(:preupgrade_report, host: @host)
        @entry = FactoryBot.create(:preupgrade_report_entry, host: @host, preupgrade_report: @report)
      end

      test 'should get index' do
        get :index, session: set_session_user
        assert_response :success
        assert_not_empty ActiveSupport::JSON.decode(@response.body)['results']
      end

      test 'should get detail of report and its entries' do
        get :show, params: { id: @report.id }
        assert_response :success

        response = ActiveSupport::JSON.decode(@response.body)
        assert_equal response['id'], @report.id
        assert_not_empty response['preupgrade_report_entries']
      end
    end
  end
end
