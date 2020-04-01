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
end
