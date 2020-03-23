# frozen_string_literal: true

class PreupgradeReportEntry < ApplicationRecord
  belongs_to :preupgrade_report

  validates :preupgrade_report_id, presence: true
  validates :hostname, presence: true
  validates :title, presence: true
  validates :actor, presence: true
  validates :audience, presence: true
  validates :severity, presence: true
  validates :leapp_run_id, presence: true
end
