# frozen_string_literal: true

require 'test_plugin_helper'

class PreupgradeReportsControllerTest < ActionController::TestCase
  setup do
    @user = FactoryBot.create(:user, admin: false)
    @host = FactoryBot.create :host
    FactoryBot.create :preupgrade_report, host: @host
  end

  test 'should get :index' do
    get :index
    assert_response :success
    assert_not_empty JSON.parse(@response.body)['results']
  end

  test 'should get :index with :view_job_invocations & :view_hosts' do
    setup_user 'view', 'job_invocations', nil, @user
    setup_user 'view', 'hosts', nil, @user
    get :index, session: set_session_user(@user)
    assert_response :success
    assert_not_empty JSON.parse(@response.body)['results']
  end

  test 'should not get :index without :view_job_invocations' do
    setup_user 'view', 'hosts', nil, @user
    get :index, session: set_session_user(@user)
    assert_response :forbidden
    assert_includes JSON.parse(@response.body)['error']['missing_permissions'], 'view_job_invocations'
  end

  test 'should not get :index without :view_hosts' do
    setup_user 'view', 'job_invocations', nil, @user
    get :index, session: set_session_user(@user)
    assert_response :forbidden
    assert_includes JSON.parse(@response.body)['error']['missing_permissions'], 'view_hosts'
  end
end
