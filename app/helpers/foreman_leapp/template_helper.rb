# frozen_string_literal: true

module ForemanLeapp
  module TemplateHelper
    def build_remediation_plan(remediation_ids, host)
      entries = PreupgradeReportEntry.where(id: remediation_ids, host: host)
                                     .where.not(detail: nil)
                                     .pluck(:detail)
      commands = []

      entries.each do |entry|
        entry['remediations']&.each do |remediation|
          next unless remediation['type'] == 'command'

          commands << "#{remediation['context'].join(' ')}\n"
        end
      end

      commands.join('')
    end
  end
end
