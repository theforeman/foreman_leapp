# frozen_string_literal: true

module Helpers
  module JobHelper
    class << self
      def correct_feature?(job_invocation, feature)
        job_invocation.job_category == ::ForemanLeapp::JOB_CATEGORY &&
          RemoteExecutionFeature.find_by(job_template_id: job_invocation.pattern_template_invocations
                                                                        .pluck(:template_id)
                                                                        .first)&.label == feature
      end
    end
  end
end
