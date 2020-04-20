# frozen_string_literal: true

require 'test_plugin_helper'

class PreupgradeReportsControllerTest < ActionController::TestCase
  setup do
    @host = FactoryBot.create :host
    FactoryBot.create :preupgrade_report, host: @host
  end

  test 'should get index' do
    get :index, session: set_session_user
    response = ActiveSupport::JSON.decode(@response.body)
    assert_equal @host.id, response['results'].first['host_id']
  end

  context 'permissions' do
    test 'with :view_job_invocations' do
      setup_user 'view', 'job_invocations'
      get :index, session: set_session_user(:one)
      assert_response :success
    end

    test 'without :view_job_invocations' do
      setup_user 'view', 'hosts'
      get :index, session: set_session_user(:one)
      assert_response :forbidden
    end
  end
end
