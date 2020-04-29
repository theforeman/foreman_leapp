# frozen_string_literal: true

class PreupgradeReport < ::Report
  belongs_to :job_invocation
  has_many :preupgrade_report_entries, dependent: :destroy

  scoped_search on: :job_invocation_id, only_explicit: true

  def self.create_report(host, data, job_invocation_id)
    report = PreupgradeReport.create(host: host, status: 0,
                                     job_invocation_id: job_invocation_id,
                                     reported_at: DateTime.now.utc)

    data['entries']&.each do |entry|
      PreupgradeReportEntry.create! entry_params(report, entry, host, data)
    end
  end

  def self.entry_params(report, entry, host, data)
    { preupgrade_report: report,
      host_id: host.id,
      hostname: host.name,
      title: entry['title'],
      actor: entry['actor'],
      audience: entry['audience'],
      severity: entry['severity'],
      leapp_run_id: data['leapp_run_id'],
      summary: entry['summary'],
      tags: entry['tags'],
      flags: entry['flags'],
      detail: entry['detail'] }
  end
end
