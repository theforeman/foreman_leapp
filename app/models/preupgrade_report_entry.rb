# frozen_string_literal: true

class PreupgradeReportEntry < ApplicationRecord
  belongs_to :preupgrade_report
  belongs_to :host

  validates :preupgrade_report, :host, :hostname, :title, :actor, :audience, :severity, :leapp_run_id, presence: true
end
