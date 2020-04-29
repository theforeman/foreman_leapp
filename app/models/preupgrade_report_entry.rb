# frozen_string_literal: true

class PreupgradeReportEntry < ApplicationRecord
  belongs_to :preupgrade_report
  belongs_to_host

  serialize :tags, Array
  serialize :flags, Array
  serialize :detail, JSON

  validates :preupgrade_report, :host, :hostname, :title, :actor, :audience, :severity, :leapp_run_id, presence: true

  def self.remediation_details(remediation_ids, host)
    where(id: remediation_ids, host: host).where.not(detail: nil).pluck(:detail)
  end
end
