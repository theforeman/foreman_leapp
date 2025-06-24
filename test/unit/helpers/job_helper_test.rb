# frozen_string_literal: true

require 'test_plugin_helper'

module Helpers
  class JobHelperTest < ActionView::TestCase
    let(:helper) { ::Helpers::JobHelper }

    let(:job_template) do
      FactoryBot.create(:job_template, template: 'echo "1"', job_category: 'leapp',
                        provider_type: 'SSH', name: 'Leapp preupgrade')
    end
    let(:job_invocation) { FactoryBot.create(:job_invocation, :with_task) }
    let(:feature_label) { 'leapp_preupgrade' }

    setup do
      FactoryBot.create(:template_invocation, template: job_template, job_invocation: job_invocation)
    end

    describe 'correct_feature?' do
      test 'returns true when feature is listed in job_features' do
        job_invocation.task.stubs(:input).returns({ 'job_features' => [feature_label] })
        assert helper.correct_feature?(job_invocation, feature_label)
      end

      test 'returns false when job_features does not include the feature and DB has no match' do
        job_invocation.task.stubs(:input).returns({ 'job_features' => ['some_other_feature'] })
        assert_not helper.correct_feature?(job_invocation, feature_label)
      end

      test 'returns true when job_features does not include the feature but DB does match' do
        RemoteExecutionFeature.find_by(label: feature_label).update(job_template: job_template)
        job_invocation.task.stubs(:input).returns({ 'job_features' => ['some_other_feature'] })
        assert helper.correct_feature?(job_invocation, feature_label)
      end

      test 'returns true when job_features key is missing but DB matches' do
        RemoteExecutionFeature.find_by(label: feature_label).update(job_template: job_template)
        job_invocation.task.stubs(:input).returns({})
        assert helper.correct_feature?(job_invocation, feature_label)
      end

      test 'returns false when job_features key is missing and DB does not match' do
        job_invocation.task.stubs(:input).returns({})
        assert_not helper.correct_feature?(job_invocation, feature_label)
      end

      test 'returns false when job_features is nil and DB does not match' do
        job_invocation.task.stubs(:input).returns({ 'job_features' => nil })
        assert_not helper.correct_feature?(job_invocation, feature_label)
      end

      test 'returns true when job_features is nil but DB matches' do
        RemoteExecutionFeature.find_by(label: feature_label).update(job_template: job_template)
        job_invocation.task.stubs(:input).returns({ 'job_features' => nil })
        assert helper.correct_feature?(job_invocation, feature_label)
      end

      test 'returns false when task is nil and feature not found in DB' do
        job_invocation.stubs(:task).returns(nil)
        assert_not helper.correct_feature?(job_invocation, feature_label)
      end

      test 'returns true when task is nil but DB matches' do
        RemoteExecutionFeature.find_by(label: feature_label).update(job_template: job_template)
        job_invocation.stubs(:task).returns(nil)
        assert helper.correct_feature?(job_invocation, feature_label)
      end
    end
  end
end
