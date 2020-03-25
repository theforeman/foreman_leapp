  module TemplateHelper
    def build_remediation_plan(remediation_ids, host)
      entries = PreupgradeReportEntry.where(id: remediation_ids.split(','), host_id: host.id)
      result = ""

      entries&.each do |entry|
        JSON.parse(entry.detail.gsub('=>',':'))['remediations']&.each do |remediation|
          result << "#{remediation['context'].join(' ')}\n"
        end
      end

      result
    end
  end
