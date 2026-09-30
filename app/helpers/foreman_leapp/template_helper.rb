# frozen_string_literal: true

module ForemanLeapp
  module TemplateHelper
    def build_remediation_plan(remediation_ids, host)
      PreupgradeReportEntry.remediation_details(remediation_ids, host)
                           .group_by { |_detail, leapp_version| leapp_version }
                           .map { |leapp_version, pairs| RemediationPlan.build(pairs.map(&:first), leapp_version) }
                           .join
    end
  end
end
