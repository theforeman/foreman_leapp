# frozen_string_literal: true

class PreupgradeReport < ::Report
  has_many :preupgrade_report_entries, dependent: :destroy

  def self.create_report(host, data)
    report = PreupgradeReport.create(host: host, status: 0, reported_at: DateTime.now.utc)
    entries = []

    data['entries']&.each do |entry|
      entries << entry.except('timeStamp', 'id')
                      .merge(preupgrade_report: report,
                             hostname: host.hostname,
                             leapp_run_id: data['leapp_run_id'])
    end

    PreupgradeReportEntry.create!(entries)
  end
end
