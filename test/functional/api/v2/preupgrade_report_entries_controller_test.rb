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
        assert_equal 2, JSON.parse(@response.body)['results'].size
      end

      test ':index supports search by title' do
        other = FactoryBot.create(:preupgrade_report_entry, host: @host, preupgrade_report: @report,
          title: 'Unique xqz title for search test')

        get :index, params: { preupgrade_report_id: @report.id,
                              search: "title = \"#{other.title}\"" }
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

      test ':index supports semantic risk_factor ordering' do
        FactoryBot.create(:preupgrade_report_entry, host: @host,
          preupgrade_report: @report, severity: 'high')
        FactoryBot.create(:preupgrade_report_entry, host: @host,
          preupgrade_report: @report, severity: 'info')

        get :index, params: { preupgrade_report_id: @report.id, order: 'risk_factor ASC' }
        assert_response :success

        severities = JSON.parse(@response.body)['results'].map { |e| e['severity'] }
        assert severities.index('info') < severities.index('high'),
          "Expected 'info' to sort before 'high' in semantic ASC order"
      end

      test 'should get :auto_complete_search' do
        get :auto_complete_search, params: { search: 'title' }
        assert_response :success
        assert_kind_of Array, JSON.parse(@response.body)
      end

      test ':auto_complete_search returns non-blank string suggestions' do
        get :auto_complete_search, params: { search: '' }
        assert_response :success
        results = JSON.parse(@response.body)
        assert_kind_of Array, results
        assert results.none?(&:blank?), 'Autocomplete results should not contain blank values'
      end

      test ':auto_complete_search scopes suggestions to report when preupgrade_report_id given' do
        get :auto_complete_search,
          params: { search: '', preupgrade_report_id: @report.id }
        assert_response :success
        assert_kind_of Array, JSON.parse(@response.body)
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

        test 'should get :auto_complete_search' do
          get :auto_complete_search, params: { search: '' }, session: set_session_user(@user)
          assert_response :success
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

        test 'should not get :auto_complete_search' do
          get :auto_complete_search, params: { search: '' }, session: set_session_user(@user)
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

        test 'should not get :auto_complete_search' do
          get :auto_complete_search, params: { search: '' }, session: set_session_user(@user)
          assert_response :forbidden
          assert_includes JSON.parse(@response.body)['error']['missing_permissions'], 'view_hosts'
        end
      end

      context 'POST bulk_remediate' do
        setup do
          @host = FactoryBot.create(:host)
          @report = FactoryBot.create(:preupgrade_report, host: @host)

          # Fixable entries
          fixable_detail = { 'remediations' => [{ 'type' => 'command', 'context' => ['yum', 'update'] }] }
          @entry1 = FactoryBot.create(:preupgrade_report_entry,
            preupgrade_report: @report, host: @host, detail: fixable_detail)
          @entry2 = FactoryBot.create(:preupgrade_report_entry,
            preupgrade_report: @report, host: @host, detail: fixable_detail)
          @entry3 = FactoryBot.create(:preupgrade_report_entry,
            preupgrade_report: @report, host: @host, detail: fixable_detail)

          @unfixable = FactoryBot.create(:preupgrade_report_entry, preupgrade_report: @report, host: @host, detail: {})
          @composer = mock('composer')
          @dummy_job = FactoryBot.create(:job_invocation)
          @composer.stubs(:trigger!)
          @composer.stubs(:job_invocation).returns(@dummy_job)
        end

        test 'triggers job invocation for all fixable entries' do
          expected_ids = [@entry1.id, @entry2.id, @entry3.id].join(',')

          JobInvocationComposer.expects(:for_feature)
                               .with('leapp_remediation_plan', [@host.id], { 'remediation_ids' => expected_ids })
                               .returns(@composer)

          post :bulk_remediate, params: { preupgrade_report_id: @report.id }
          assert_response :success
          json = ActiveSupport::JSON.decode(response.body)
          assert_equal @dummy_job.id, json['id']
        end

        test 'respects the excluded_ids parameter' do
          expected_ids = [@entry1.id, @entry3.id].join(',')

          JobInvocationComposer.expects(:for_feature)
                               .with('leapp_remediation_plan', [@host.id], { 'remediation_ids' => expected_ids })
                               .returns(@composer)

          post :bulk_remediate, params: {
            preupgrade_report_id: @report.id,
            excluded_ids: [@entry2.id],
          }
          assert_response :success
        end

        test 'returns error if no fixable entries match' do
          JobInvocationComposer.expects(:for_feature).never

          post :bulk_remediate, params: {
            preupgrade_report_id: @report.id,
            excluded_ids: [@entry1.id, @entry2.id, @entry3.id],
          }
          assert_response :unprocessable_entity
          json = ActiveSupport::JSON.decode(response.body)
          assert_equal 'No fixable entries found matching the selection.', json['error']
        end
      end
    end
    # rubocop:enable Metrics/ClassLength
  end
end
