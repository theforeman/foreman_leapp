# frozen_string_literal: true

module Helpers
  module JobHelper
    class << self
      # Returns true if the given feature is present in the job_invocation's job_features,
      # or if a matching RemoteExecutionFeature exists for the job_template.
      def correct_feature?(job_invocation, feature)
        # check if the feature exists in the DB for the job_template
        template_id = job_invocation.pattern_template_invocations.first.template_id
        return true if RemoteExecutionFeature.exists?(job_template_id: template_id, label: feature)

        # Fallback: check if the feature is present in job_features
        job_features = Array(job_invocation.task&.input&.[]('job_features'))
        job_features.include?(feature)
      end
    end
  end
end
