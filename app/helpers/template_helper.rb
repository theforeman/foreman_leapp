  module TemplateHelper
    def build_remediation_plan(remediation_ids, host)
      entries = PreupgradeReportEntry.where(id: remediation_ids, host: host)
                    .where.not(detail: nil)
                    .pluck(:detail)
      result = ""

      entries.each do |entry|
        JSON.parse(entry)['remediations']&.each do |remediation|
          next unless remediation['type'] == 'command'
          result << "#{remediation['context'].join(' ')}\n"
        end
      end

      result
    end
  end
