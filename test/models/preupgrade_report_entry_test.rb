# frozen_string_literal: true

require 'test_plugin_helper'

class PreupgradeReportEntryTest < ActiveSupport::TestCase
  should belong_to(:preupgrade_report)
  should belong_to(:host)

  should validate_presence_of(:preupgrade_report)
  should validate_presence_of(:host)
  should validate_presence_of(:hostname)
  should validate_presence_of(:title)
  should validate_presence_of(:actor)
  should validate_presence_of(:audience)
  should validate_presence_of(:severity)
  should validate_presence_of(:leapp_run_id)

  describe 'remediation_details' do
    setup do
      @host = FactoryBot.create(:host)

      report = FactoryBot.create(:preupgrade_report)
      @entry1 = FactoryBot.create(:preupgrade_report_entry, preupgrade_report: report, host: @host)
      @entry2 = FactoryBot.create(:preupgrade_report_entry, preupgrade_report: report, host: @host, detail: nil)
    end

    it do
      details = PreupgradeReportEntry.remediation_details([@entry1.id, @entry2.id], @host.id)
      assert_equal details.size, 1
      assert_equal details[0], @entry1.detail

      details = PreupgradeReportEntry.remediation_details([@entry1.id, @entry2.id], FactoryBot.create(:host))
      assert_equal details.size, 0
    end
  end
end
