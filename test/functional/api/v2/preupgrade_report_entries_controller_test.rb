# frozen_string_literal: true

require 'test_plugin_helper'

module Api
  module V2
    # rubocop:disable Metrics/ClassLength
    class PreupgradeReportEntriesControllerTest < ActionController::TestCase
      setup do
        @host = FactoryBot.create(:host)
        @job_invocation = FactoryBot.create(:job_invocation)
        @report = FactoryBot.create(:preupgrade_report, host: @host, job_invocation: @job_invocation)
        @entry = FactoryBot.create(:preupgrade_report_entry, host: @host, preupgrade_report: @report)
      end

      test 'should get :index' do
        get :index, params: { preupgrade_report_id: @report.id }
        assert_response :success

        body = JSON.parse(@response.body)
        assert_not_empty body['results']
        assert_equal @entry.id, body['results'].first['id']
        assert_equal 1, body['total']
        assert_equal 1, body['subtotal']
      end

      test ':index response includes expected entry fields' do
        get :index, params: { preupgrade_report_id: @report.id }
        assert_response :success

        entry_json = JSON.parse(@response.body)['results'].first
        %w[id title hostname severity host_id preupgrade_report_id flags detail].each do |field|
          assert entry_json.key?(field), "Expected field '#{field}' to be present"
        end
      end

      test ':index returns 404 for non-existent preupgrade_report_id' do
        get :index, params: { preupgrade_report_id: 0 }
        assert_response :not_found
      end

      test ':index does not return entries belonging to a different report' do
        other_report = FactoryBot.create(:preupgrade_report, host: @host,
          job_invocation: @job_invocation)
        other_entry = FactoryBot.create(:preupgrade_report_entry, host: @host,
          preupgrade_report: other_report)

        get :index, params: { preupgrade_report_id: @report.id }
        assert_response :success

        ids = JSON.parse(@response.body)['results'].map { |e| e['id'] }
        assert_includes ids, @entry.id
        assert_not_includes ids, other_entry.id
      end

      test ':index supports pagination' do
        FactoryBot.create_list(:preupgrade_report_entry, 4, host: @host, preupgrade_report: @report)

        get :index, params: { preupgrade_report_id: @report.id, per_page: 2, page: 1 }
        assert_response :success

        body = JSON.parse(@response.body)
        assert_equal 2, body['results'].size
        assert_equal 5, body['total']
      end

      test ':index second page returns correct entries' do
        FactoryBot.create_list(:preupgrade_report_entry, 4, host: @host, preupgrade_report: @report)

        get :index, params: { preupgrade_report_id: @report.id, per_page: 2, page: 2 }
        assert_response :success

        body = JSON.parse(@response.body)
        assert_equal 2, body['results'].size
      end

      test ':index supports search by title' do
        other = FactoryBot.create(:preupgrade_report_entry, host: @host, preupgrade_report: @report,
          title: 'Unique xqz title for search test')

        get :index, params: {
          preupgrade_report_id: @report.id,
          search: "title = \"#{other.title}\"",
        }
        assert_response :success

        body = JSON.parse(@response.body)
        assert_equal 1, body['results'].size
        assert_equal other.id, body['results'].first['id']
      end

      test ':index supports order parameter' do
        FactoryBot.create(:preupgrade_report_entry, host: @host,
          preupgrade_report: @report, title: 'AAAA sorts first')
        FactoryBot.create(:preupgrade_report_entry, host: @host,
          preupgrade_report: @report, title: 'ZZZZ sorts last')

        get :index, params: { preupgrade_report_id: @report.id, order: 'title ASC' }
        assert_response :success

        titles = JSON.parse(@response.body)['results'].map { |e| e['title'] }
        assert titles.index('AAAA sorts first') < titles.index('ZZZZ sorts last')
      end

      context 'with permissions' do
        setup do
          @user = FactoryBot.create(:user, admin: false)
          setup_user('view', 'job_invocations', nil, @user)
          setup_user('view', 'hosts', nil, @user)
        end

        test 'should get :index' do
          get :index, params: { preupgrade_report_id: @report.id }, session: set_session_user(@user)
          assert_response :success
          assert_not_empty JSON.parse(@response.body)['results']
        end
      end

      context 'without :view_job_invocations' do
        setup do
          @user = FactoryBot.create(:user, admin: false)
          setup_user('view', 'hosts', nil, @user)
        end

        test 'should not get :index' do
          get :index, params: { preupgrade_report_id: @report.id }, session: set_session_user(@user)
          assert_response :forbidden
          assert_includes JSON.parse(@response.body)['error']['missing_permissions'],
            'view_job_invocations'
        end
      end

      context 'without :view_hosts' do
        setup do
          @user = FactoryBot.create(:user, admin: false)
          setup_user('view', 'job_invocations', nil, @user)
        end

        test 'should not get :index' do
          get :index, params: { preupgrade_report_id: @report.id }, session: set_session_user(@user)
          assert_response :forbidden
          assert_includes JSON.parse(@response.body)['error']['missing_permissions'], 'view_hosts'
        end
      end
    end
    # rubocop:enable Metrics/ClassLength
  end
end
