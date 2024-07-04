# frozen_string_literal: true

module JobHelper
  class << self
    def correct_feature?(job_invocation, feature)
      RemoteExecutionFeature.where(job_template_id: job_invocation.pattern_template_invocations
                                                                  .first
                                                                  .template_id, label: feature).any?
    end
  end
end
